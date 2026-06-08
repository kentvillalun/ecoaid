import { prisma } from "../config/db.js";
import { pickupRequest } from "./pickup-request.controller.js";

const getDashboardStats = async (req, res) => {
  try {
    const [requestedCount, totalRecords, unverified] = await Promise.all([
      prisma.pickupRequests.count({
        where: { status: "REQUESTED" },
      }),
      prisma.pickupRequests.count({
        where: { status: "COLLECTED" },
      }),
      prisma.user.count({
        where: { isVerified: false, role: "RESIDENT" },
      }),
    ]);

    return res.status(200).json({
      message: "Fetch success",
      requestedCount,
      totalRecords,
      unverified,
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
