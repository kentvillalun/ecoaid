import { prisma } from "../config/db.js";
import { pickupRequest } from "./pickup-request.controller.js";

const getDashboardStats = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const [
      requestedCount,
      totalRecords,
      unverified,
      totalCollected,
      totalExpenses,
      saleItems,
    ] = await Promise.all([
      prisma.pickupRequests.count({
        where: { barangayId, status: "REQUESTED" },
      }),
      prisma.pickupRequests.count({
        where: { barangayId, status: "COLLECTED" },
      }),
      prisma.user.count({
        where: { barangayId, isVerified: false, role: "RESIDENT" },
      }),
      prisma.stockTransactionLog.aggregate({
        where: { barangayId, transactionType: "IN", unit: "KG" },
        _sum: { quantity: true },
      }),
      prisma.programExpense.aggregate({
        where: { barangayId },
        _sum: { amount: true },
      }),
      prisma.junkshopSaleItem.findMany({
        where: { junkshopSale: { junkshop: { barangayId } } },
        select: { cost: true, quantity: true },
      }),
    ]);

    const totalIncome = saleItems.reduce(
      (total, item) => total + item.cost * item.quantity,
      0,
    );
    const expenses = totalExpenses._sum.amount ?? 0;

    return res.status(200).json({
      message: "Fetch success",
      requestedCount,
      totalRecords,
      unverified,
      totalCollectedKg: totalCollected._sum.quantity ?? 0,
      fundBalance: totalIncome - expenses,
      programExpenses: expenses,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const recentTransactions = await prisma.collectionItem.findMany({
      take: 3,
      include: {
        request: {
          select: {
            createdAt: true,
            isAssorted: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            material: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
        },
      },
      orderBy: {
       request: {
        createdAt: "desc"
       }
      },
    });

    return res.status(200).json({
      message: "Fetch successful",
      recentTransactions
    })
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getDashboardStats, getRecentTransactions };
