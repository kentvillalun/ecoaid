import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";

const pickupRequest = async (req, res) => {
  try {
    const {
      materialId,
      estimatedValue,
      estimatedUnit,
      photoUrl,
      notes,
      isAssorted,
    } = req.body ?? {};

    const userId = req.user.id;
    const barangayId = req.user.barangayId;

    if (
      !estimatedValue ||
      !estimatedUnit ||
      !photoUrl ||
      (!isAssorted && !materialId)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await prisma.pickupRequests.create({
      data: {
        userId,
        materialId,
        estimatedValue,
        estimatedUnit,
        photoUrl,
        notes,
        isAssorted,
        barangayId,
      },
    });

    return res.status(200).json({ message: "Request submittion success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const listRequests = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() - 2);

    const expiringRequests = await prisma.pickupRequests.findMany({
      where: {
        status: "REQUESTED",
        barangayId,
        createdAt: {
          lt: expiryThreshold,
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const updatedRequests = await prisma.$transaction(async (tx) => {
      await tx.pickupRequests.updateMany({
        where: {
          status: "REQUESTED",
          barangayId,
          createdAt: {
            lt: expiryThreshold,
          },
        },
        data: {
          status: "EXPIRED",
          closedAt: new Date(),
        },
      });

      if (expiringRequests.length > 0) {
        await tx.notifications.createMany({
          data: expiringRequests.map((r) => ({
            userId: r.user.id,
            pickupRequestId: r.id,
            type: "EXPIRED",
          })),
          skipDuplicates: true,
        });
      }

      const requests = await tx.pickupRequests.findMany({
        where: {
          barangayId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              sitio: { select: { name: true } },
              phoneNumber: true,
            },
          },
          id: true,
          createdAt: true,
          material: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          estimatedValue: true,
          estimatedUnit: true,
          status: true,
          photoUrl: true,
          approvedAt: true,
          rejectedAt: true,
          isScheduled: true,
          closedAt: true,
          rejectionReason: true,
          collectedAt: true,
          isAssorted: true,
        },
      });
      
      return requests;
    });
    return res.status(200).json({
      message: "Fetching requests successful",
      requests: updatedRequests,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, items } = req.body ?? {};
    const { barangayId } = req.user;

    if (status === "APPROVED") {
      const request = await prisma.pickupRequests.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: new Date() },
      });

      await prisma.notifications.create({
        data: {
          userId: request.userId,
          pickupRequestId: id,
          type: "APPROVED",
        },
      });

      return res.status(200).json({ message: "Request Approved" });
    }

    if (status === "IN_PROGRESS") {
      const request = await prisma.pickupRequests.update({
        where: { id },
        data: { isScheduled: true, status: "IN_PROGRESS" },
      });

      await prisma.notifications.create({
        data: {
          userId: request.userId,
          pickupRequestId: id,
          type: "IN_PROGRESS",
        },
      });

      return res.status(200).json({ message: "Request Scheduled " });
    }

    if (status === "COLLECTED") {
      const { userId } = await prisma.pickupRequests.findUnique({
        where: { id },
        select: {
          userId: true,
        },
      });

      await prisma.$transaction(async (tx) => {
        await tx.collectionItem.createMany({
          data: items.map((item) => ({
            requestId: id,
            materialId: item.materialId,
            actualValue: item.actualValue,
            actualUnit: item.actualUnit,
          })),
          skipDuplicates: true,
        });

        await tx.stockTransactionLog.createMany({
          data: items.map((item) => ({
            barangayId,
            userId,
            collectionRequestId: id,
            source: "COLLECTION_REQUEST",
            transactionType: "IN",
            materialId: item.materialId,
            quantity: convertToKg(item.actualValue, item.actualUnit),
            unit: item.actualUnit === "PIECE" ? "PIECE" : "KG",
          })),
          skipDuplicates: true,
        });

        await tx.pickupRequests.update({
          where: { id },
          data: {
            status: "COLLECTED",
            collectedAt: new Date(),
          },
        });

        await tx.notifications.create({
          data: {
            userId,
            pickupRequestId: id,
            type: "COLLECTED",
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            isVerified: true,
          },
        });
      });

      return res.status(200).json({ message: "Request Collected " });
    }

    if (status === "REJECTED") {
      if (!rejectionReason) {
        return res
          .status(400)
          .json({ error: "Missing rejection reason field" });
      }

      const request = await prisma.pickupRequests.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason: rejectionReason,
        },
      });

      await prisma.notifications.create({
        data: {
          userId: request.userId,
          pickupRequestId: request.id,
          type: "REJECTED",
        },
      });

      return res.status(200).json({ message: "Request Rejected" });
    }

    return res.status(400).json({ error: "Invalid request" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.pickupRequests.findUnique({
      where: { id },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            sitio: {
              select: {
                name: true,
              },
            },
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        estimatedValue: true,
        estimatedUnit: true,
        notes: true,
        photoUrl: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
        collectedAt: true,
        status: true,
        rejectionReason: true,
        isAssorted: true,
        collectionItems: {
          select: {
            material: {
              select: {
                category: {
                  select: {
                    name: true,
                  },
                },
                name: true,
              },
            },
            actualValue: true,
            actualUnit: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(400).json({ error: "Request does not exist" });
    }

    return res.status(200).json({
      message: "Fetching request detail success",
      request,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getMyRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit;

    const take = limit ? parseInt(limit) : undefined;

    const requests = await prisma.pickupRequests.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        material: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        status: true,
        createdAt: true,
        notes: true,
        estimatedValue: true,
        estimatedUnit: true,
        photoUrl: true,
        isAssorted: true,
      },
      ...(take && { take }),
    });

    return res.status(200).json({
      message: "Fetch requests successful",
      requests,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyRequestsById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await prisma.pickupRequests.findUnique({
      where: { id, userId },
      select: {
        photoUrl: true,
        material: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        status: true,
        notes: true,
        estimatedValue: true,
        estimatedUnit: true,
        createdAt: true,
        approvedAt: true,
        isScheduled: true,
        collectedAt: true,
        rejectedAt: true,
        isAssorted: true,
        collectionItems: {
          select: {
            material: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            actualValue: true,
            actualUnit: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request do not exist" });
    }

    return res.status(200).json({
      message: "Fetch request successful",
      request,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { id } = req.user;

    const result = await prisma.pickupRequests.updateMany({
      where: {
        id: requestId,
        userId: id,
        status: "REQUESTED",
      },
      data: {
        status: "CANCELLED",
        closedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return res.status(400).json({
        error: "This request can no longer be cancelled.",
      });
    }

    return res.status(200).json({ message: "Request has been cancelled" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  pickupRequest,
  listRequests,
  updateStatus,
  getRequest,
  getMyRequest,
  cancelRequest,
  getMyRequestsById,
};
