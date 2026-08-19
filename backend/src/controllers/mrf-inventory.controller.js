import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";

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

    const materialIds = results.map((r) => r.materialId);

    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const enrichedResults = results.map((result) => {
      const material = materials.find((m) => m.id === result.materialId);

      return {
        ...result,
        materialName: material?.name,
        category: material?.category?.name,
      };
    });

    return res
      .status(200)
      .json({ message: "Fetching stock summary successful", enrichedResults });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTransactionLogs = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const transactionLogs = await prisma.stockTransactionLog.findMany({
      where: { barangayId },
      select: {
        id: true,
        materialId: true,
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
        createdAt: true,
        source: true,
        unit: true,
        quantity: true,
        transactionType: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Running balance per material, applied in chronological order, so each
    // row can carry the balance as of that transaction (currentTotal).
    const runningBalances = {};

    const transactionLogsWithRunningTotal = transactionLogs.map((log) => {
      const balanceBefore = runningBalances[log.materialId] ?? 0;
      const balanceAfter =
        log.transactionType === "IN"
          ? balanceBefore + log.quantity
          : balanceBefore - log.quantity;

      runningBalances[log.materialId] = balanceAfter;

      return { ...log, currentTotal: balanceAfter };
    });

    transactionLogsWithRunningTotal.reverse();

    return res.status(200).json({
      message: "Fetching stock transaction logs success",
      transactionLogs: transactionLogsWithRunningTotal,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const recordStockOut = async (req, res) => {
  try {
    const { id, barangayId } = req.user;
    const { materialId, unit, quantity } = req.body ?? {};

    if (!materialId || !unit || !quantity) {
      return res.status(422).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const materialSummary = await prisma.stockTransactionLog.groupBy({
      where: { barangayId, materialId },
      by: ["transactionType"],
      _sum: { quantity: true },
    });

    const inEntry = materialSummary.find((m) => m.transactionType === "IN");
    const outEntry = materialSummary.find((m) => m.transactionType === "OUT");

    const inEntryBalance = inEntry?._sum?.quantity ?? 0;
    const outEntryBalance = outEntry?._sum?.quantity ?? 0;

    let currentBalance = inEntryBalance - outEntryBalance;
    
    if (convertToKg(quantity, unit) > currentBalance) {
      return res.status(400).json({ error: "Current balance is not enough for deduction"})
    }

    const stockOutTransaction = await prisma.stockTransactionLog.create({
      data: {
        barangayId,
        userId: id,
        performedBy: `${user.firstName} ${user.lastName}`,
        materialId,
        quantity: convertToKg(quantity, unit),
        unit: unit === "PIECE" ? "PIECE" : "KG",
        source: "MANUAL_ADJUSTMENT",
        transactionType: "OUT",
      },
    });

    return res.status(201).json({ message: "Stock out transaction created" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getStockSummary, getTransactionLogs, recordStockOut };
