import { prisma } from "../config/db.js";

const recordIntake = async (req, res) => {
  try {
    const { id, barangayId, role } = req.user;
    const { items, userId, householdName } = req.body ?? {};

    const collectorName = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!collectorName) {
      return res.status(400).json({ error: "Collector does not exist." });
    }

    if (!items) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const transaction = await prisma.manualIntakeTransaction.create({
      data: {
        userId,
        householdName,
        collectorId: id,
        barangayId,
        collectorName: `${collectorName.firstName} ${collectorName.lastName}`,
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
            lastName: true,
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
