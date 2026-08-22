import { prisma } from "../config/db.js";

// A beneficiary's points are scoped to a single program, not global. This
// computes that scoped balance instead of relying on Beneficiary.points,
// which is a single running total shared across every program a beneficiary
// has ever participated in.
//
// Balance = points earned from redemption transactions under this program
//           minus points already spent on reward releases under this program.
export const getBeneficiaryProgramBalance = async (beneficiaryId, programId) => {
  const redemptionItems = await prisma.redemptionTransactionItem.findMany({
    where: {
      redemptionTransaction: {
        beneficiaryId,
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
      beneficiaryId,
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
