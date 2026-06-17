import { prisma } from "../config/db.js";

const getStockSummary = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const stockSummary = await prisma.stockTransactionLog.groupBy({
      where: { barangayId },
      by: ["materialId", "transactionType", "unit"],
      _sum: { quantity: true },
    });

    const balanceMap = stockSummary.reduce((acc, row) => {
      const key = `${row.materialId}_${row.unit}`;

      if (!acc[key]) {
        acc[key] = { materialId: row.materialId, unit: row.unit, balance: 0 };
      }

      if (row.transactionType === "IN") {
        acc[key].balance += row._sum.quantity;
      } else {
        acc[key].balance -= row._sum.quantity;
      }

      return acc;
    }, {});

    const results = Object.values(balanceMap);

    return res
      .status(200)
      .json({ message: "Fetching stock summary successful", results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getStockSummary }