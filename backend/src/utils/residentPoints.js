import { prisma } from "../config/db.js";

// A resident's points are scoped to a single program, not global. Nothing
// stores the number; it is computed from the resident's own history, so the
// balance and the records can never disagree.
//
// Balance = points earned from redemption transactions under this program
//           minus points already spent on reward releases under this program.
export const getResidentProgramBalance = async (residentId, programId) => {
  const redemptionItems = await prisma.redemptionTransactionItem.findMany({
    where: {
      redemptionTransaction: {
        residentId,
        programId,
      },
    },
    select: {
      amount: true,
      currentValue: true,
    },
  });

  const pointsEarned = redemptionItems.reduce((total, item) => {
    return total + item.amount * item.currentValue;
  }, 0);

  const rewardReleases = await prisma.rewardRelease.findMany({
    where: {
      residentId,
      programId,
    },
    select: {
      quantity: true,
      rewardItem: {
        select: {
          pointCost: true,
        },
      },
    },
  });

  const pointsSpent = rewardReleases.reduce((total, release) => {
    return total + release.quantity * release.rewardItem.pointCost;
  }, 0);

  return pointsEarned - pointsSpent;
};
