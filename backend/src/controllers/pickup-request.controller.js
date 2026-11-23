import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";
import { findUnitMismatch } from "../utils/unitMismatch.js";
import { getMismatchAlert } from "../utils/photoMismatch.js";

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
          // a banned resident's open requests are not collected, so hide them;
          // their collected and rejected history stays for the records
          NOT: {
            status: { in: ["REQUESTED", "APPROVED", "IN_PROGRESS"] },
            user: { isActive: false },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          user: {
            select: {
              firstName: true,
              middleName: true,
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
              defaultUnit: true,
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
    const { status, rejectionReason, items, isAssorted, photoMismatch } =
      req.body ?? {};
    const { barangayId } = req.user;

    // the collector's photo-mismatch flag is optional (a normal request omits
    // it), but when it is sent it must be a real boolean
    if (photoMismatch !== undefined && typeof photoMismatch !== "boolean") {
      return res
        .status(400)
        .json({ error: "photoMismatch must be true or false" });
    }

    if (status === "APPROVED") {
      const request = await prisma.pickupRequests.update({
        where: { id, barangayId },
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
        where: { id, barangayId },
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
      const requestData = await prisma.pickupRequests.findUnique({
        where: { id, barangayId },
        select: {
          userId: true,
          isAssorted: true,
        },
      });

      if (!requestData) {
        return res.status(400).json({ error: "Request not found" });
      }

      const { userId } = requestData;

      // the collector has the final say on what was collected, so the
      // resident's single/assorted choice can be overridden here; without a
      // choice, the request keeps what the resident submitted
      const finalIsAssorted =
        typeof isAssorted === "boolean" ? isAssorted : requestData.isAssorted;

      const validUnits = ["KG", "GRAMS", "LBS", "PIECE"];
      const hasInvalidItem =
        !Array.isArray(items) ||
        items.length === 0 ||
        items.some(
          (item) =>
            !item.materialId ||
            !(item.actualValue > 0) ||
            !validUnits.includes(item.actualUnit),
        );

      if (hasInvalidItem) {
        return res.status(400).json({
          error: "Every item needs a material, a weight above 0 and a unit",
        });
      }

      if (!finalIsAssorted && items.length !== 1) {
        return res.status(400).json({
          error: "A single material collection must have exactly one item",
        });
      }

      const materialIds = [...new Set(items.map((item) => item.materialId))];
      const ownMaterials = await prisma.material.findMany({
        where: { id: { in: materialIds }, barangayId },
        select: { id: true, name: true, defaultUnit: true },
      });

      if (ownMaterials.length !== materialIds.length) {
        return res.status(400).json({ error: "Invalid material" });
      }

      const unitError = findUnitMismatch(items, ownMaterials, "actualUnit");

      if (unitError) {
        return res.status(400).json({ error: unitError });
      }

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
          where: { id, barangayId },
          data: {
            status: "COLLECTED",
            collectedAt: new Date(),
            isAssorted: finalIsAssorted,
            photoMismatch: photoMismatch === true,
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

      // only when a mismatch was reported: tells the collector if this one
      // brought the resident to the limit. The request is already saved, so a
      // failure here must not turn into an error (.catch gives null instead)
      const mismatch =
        photoMismatch === true
          ? await getMismatchAlert(prisma, barangayId, userId).catch(() => null)
          : null;

      return res.status(200).json({ message: "Request Collected ", mismatch });
    }

    if (status === "REJECTED") {
      const reason =
        typeof rejectionReason === "string" ? rejectionReason.trim() : "";

      if (!reason) {
        return res
          .status(400)
          .json({ error: "Missing rejection reason field" });
      }

      const request = await prisma.pickupRequests.update({
        where: { id, barangayId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason: reason,
          // a collector who finds nothing to collect can still report that
          // the photo did not match
          photoMismatch: photoMismatch === true,
        },
      });

      await prisma.notifications.create({
        data: {
          userId: request.userId,
          pickupRequestId: request.id,
          type: "REJECTED",
        },
      });

      const mismatch =
        photoMismatch === true
          ? await getMismatchAlert(prisma, barangayId, request.userId).catch(
              () => null,
            )
          : null;

      return res.status(200).json({ message: "Request Rejected", mismatch });
    }

    return res.status(400).json({ error: "Invalid request" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { barangayId } = req.user;

    const request = await prisma.pickupRequests.findUnique({
      where: { id, barangayId },
      select: {
        user: {
          select: {
            firstName: true,
            middleName: true,
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
            defaultUnit: true,
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
        closedAt: true,
        collectedAt: true,
        status: true,
        rejectionReason: true,
        isAssorted: true,
        photoMismatch: true,
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

// Staff can correct the photo-mismatch flag after the request is closed.
// There is no history of who changed it (shortcut: add an audit log if needed).
const updatePhotoMismatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoMismatch } = req.body ?? {};
    const { barangayId } = req.user;

    if (typeof photoMismatch !== "boolean") {
      return res
        .status(400)
        .json({ error: "photoMismatch must be true or false" });
    }

    // only collected or rejected requests count toward a resident's mismatches
    const result = await prisma.pickupRequests.updateMany({
      where: { id, barangayId, status: { in: ["COLLECTED", "REJECTED"] } },
      data: { photoMismatch },
    });

    if (result.count === 0) {
      return res
        .status(400)
        .json({ error: "Only collected or rejected requests can be changed" });
    }

    return res.status(200).json({ message: "Photo mismatch updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  updatePhotoMismatch,
  pickupRequest,
  listRequests,
  updateStatus,
  getRequest,
  getMyRequest,
  cancelRequest,
  getMyRequestsById,
};
