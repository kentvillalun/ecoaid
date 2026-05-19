import { prisma } from "../config/db.js";

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
      },
    });

    return res.status(200).json({ message: "Request submittion success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const listRequests = async (req, res) => {
  try {
    const requests = await prisma.pickupRequests.findMany({
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
        approvedAt: true,
        isScheduled: true,
        rejectionReason: true,
        collectedAt: true,
        isAssorted: true,
      },
    });

    return res.status(200).json({
      message: "Fetching requests successful",
      requests,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, items } =
      req.body ?? {};

    if (status === "APPROVED") {
      await prisma.pickupRequests.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: new Date() },
      });

      return res.status(200).json({ message: "Request Approved" });
    }

    if (status === "IN_PROGRESS") {
      await prisma.pickupRequests.update({
        where: { id },
        data: { isScheduled: true, status: "IN_PROGRESS" },
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

      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
        },
      });

      await prisma.collectionItem.createMany({
        data: items.map((item) => ({
          requestId: id,
          materialId: item.materialId,
          actualValue: item.actualValue,
          actualUnit: item.actualUnit,
        })),
        skipDuplicates: true,
      });

      await prisma.pickupRequests.update({
        where: { id },
        data: {
          status: "COLLECTED",
          collectedAt: new Date(),
        },
      });

      return res.status(200).json({ message: "Request Collected " });
    }

    if (status === "REJECTED") {
      if (!rejectionReason) {
        return res
          .status(400)
          .json({ error: "Missing rejection reason field" });
      }

      await prisma.pickupRequests.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason: rejectionReason,
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
                name: true
              }
            }
          }
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
                name: true
              }
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
              }
            }
          }
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
              }
            }
          }
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
                    name: true
                  }
                }
              }
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

export {
  pickupRequest,
  listRequests,
  updateStatus,
  getRequest,
  getMyRequest,
  getMyRequestsById,
};
