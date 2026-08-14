import { prisma } from "../config/db.js";

const filterReports = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate || !type) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (
      ![
        "material-stock",
        "collection-intake",
        "redemption",
        "program-funds",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid type" });
    }

    switch (type) {
      case "material-stock":
        const materials = await prisma.stockTransactionLog.findMany({
          where: {
            barangayId,
            createdAt: {
              gte: new Date(startDate),
              lt: new Date(endDate),
            },
          },
          select: {
            id: true,
            createdAt: true,
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
            transactionType: true,
            quantity: true,
            unit: true
          },
        });

        
        break;
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
