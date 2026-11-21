import { prisma } from "../config/db.js";
import { formatFullName } from "../utils/formatFullName.js";
import { convertToKg } from "../utils/covertToKg.js";
import { findUnitMismatch } from "../utils/unitMismatch.js";

const recordIntake = async (req, res) => {
  try {
    const { id, barangayId, role } = req.user;
    const { items, userId, householdName } = req.body ?? {};

    const collectorName = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
      },
    });

    if (!collectorName) {
      return res.status(400).json({ error: "Collector does not exist." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const materialIds = [...new Set(items.map((item) => item.materialId))];
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds }, barangayId },
      select: { id: true, name: true, defaultUnit: true },
    });

    if (materials.length !== materialIds.length) {
      return res.status(400).json({ error: "Invalid material" });
    }

    const unitError = findUnitMismatch(items, materials, "unit");

    if (unitError) {
      return res.status(400).json({ error: unitError });
    }

    const hasHousehold = Boolean(householdName?.trim());

    if (Boolean(userId) === hasHousehold) {
      return res.status(400).json({
        error: "Provide either a registered resident or a household name.",
      });
    }

    if (userId) {
      const resident = await prisma.user.findFirst({
        where: { id: userId, barangayId, isActive: true },
        select: { id: true },
      });

      if (!resident) {
        return res.status(400).json({ error: "Resident does not exist." });
      }
    }

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.manualIntakeTransaction.create({
        data: {
          userId,
          householdName,
          collectorId: id,
          barangayId,
          collectorName: formatFullName(collectorName),
          manualIntakeItems: {
            createMany: {
              data: items.map((item) => ({
                materialId: item.materialId,
                quantity: item.quantity,
                unit: item.unit,
              })),
              skipDuplicates: true,
            },
          },
        },
      });

      if (userId) {
        await tx.user.update({
          where: {
            id: userId
          },
          data: {
            isVerified: true
          }
        })
      }

      const transactionLog = await tx.stockTransactionLog.createMany({
        data: items.map((item) => ({
          barangayId,
          userId,
          manualIntakeTransactionId: transaction.id,
          source: "MANUAL_INTAKE",
          transactionType: "IN",
          materialId: item.materialId,
          quantity: convertToKg(item.quantity, item.unit),
          unit: item.unit === "PIECE" ? "PIECE" : "KG",
        })),
        skipDuplicates: true,
      });
    });

    return res
      .status(201)
      .json({ message: "Manual intake transaction created" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getIntakeTransactions = async (req, res) => {
  const barangayId = req.user.barangayId;
  try {
    const transactions = await prisma.manualIntakeTransaction.findMany({
      where: { barangayId },
      select: {
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            sitioId: true,
            sitio: {
              select: {
                name: true,
              },
            },
          },
        },
        id: true,
        householdName: true,
        createdAt: true,
        manualIntakeItems: {
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
            quantity: true,
            unit: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching intake transactions success", transactions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { recordIntake, getIntakeTransactions };
