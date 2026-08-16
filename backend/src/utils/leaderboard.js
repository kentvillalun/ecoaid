import { prisma } from "../config/db.js";

export const getRankedLeaderboard = async (barangayId, unit) => {
  const grouped = await prisma.stockTransactionLog.groupBy({
    by: ["userId"],
    where: {
      barangayId,
      transactionType: "IN",
      userId: { not: null },
      unit,
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, firstName: true, lastName: true, purok: true },
  });

  return grouped.map((entry, index) => {
    const user = users.find((u) => u.id === entry.userId);
    return {
      rank: index + 1,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      purok: user.purok,
      total: entry._sum.quantity,
    };
  });
};
