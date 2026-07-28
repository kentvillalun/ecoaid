import { prisma } from "../config/db.js";

const addRewardItem = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, category, programId, quantity, pointCost } = req.body ?? {};

    if (!programId || !name || !category || !quantity || !pointCost) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    await prisma.rewardItem.create({
      data: {
        programId,
        barangayId,
        category,
        name,
        quantity,
        pointCost,
      },
    });

    return res
      .status(201)
      .json({ message: "Reward item has been added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRewardItems = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const items = await prisma.rewardItem.findMany({
      where: {
        barangayId,
      },
      select: {
        id: true,
        program: {
          select: {
            name: true,
          },
        },
        category: true,
        name: true,
        quantity: true,
        createdAt: true,
        rewardReleases: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const rewardItems = items.map((r) => {
      const totalReleases = r.rewardReleases.reduce((total, current) => {
        return total + current.quantity;
      }, 0);

      return {
        id: r.id,
        programName: r.program.name,
        category: r.category,
        name: r.name,
        available: r.quantity - totalReleases,
        createdAt: r.createdAt,
      };
    });

    return res
      .status(200)
      .json({ message: "Fetch reward items successful", rewardItems });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const releaseReward = async (req, res) => {
  try {
    const { beneficiaryId, programId, items } = req.body ?? {};
    const { barangayId, id, role } = req.user;

    if (!beneficiaryId || !programId || !items) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const rewardItems = await prisma.rewardItem.findMany({
      where: {
        programId,
        barangayId,
        id: { in: items.map((i) => i.rewardItemId) },
      },
      select: {
        id: true,
        quantity: true,
        pointCost: true,
        rewardReleases: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const beneficiary = await prisma.beneficiary.findUnique({
      where: { barangayId, id: beneficiaryId },
      select: {
        name: true,
        points: true,
      },
    });

    if (!beneficiary) {
      return res.status(404).json({ error: "Beneficiary not found " });
    }

    const user = await prisma.user.findUnique({
      where: { barangayId, id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const availabilityCheck = items.every((item) => {
      const rewardItem = rewardItems.find((r) => r.id === item.rewardItemId);
      const totalReleased = rewardItem.rewardReleases.reduce(
        (t, r) => t + r.quantity,
        0,
      );
      const available = rewardItem.quantity - totalReleased;
      return available >= item.quantity;
    });

    if (!availabilityCheck) {
      return res
        .status(400)
        .json({ error: "Insufficient stock for one or mroe items " });
    }

    const totalPointCost = items.reduce((total, item) => {
      const rewardItem = rewardItems.find((r) => r.id === item.rewardItemId);
      return total + rewardItem.pointCost * item.quantity;
    }, 0);

    if (beneficiary.points < totalPointCost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewardRelease.createMany({
        data: items.map((item) => ({
          rewardItemId: item.rewardItemId,
          userId: id,
          beneficiaryId,
          programId,
          barangayId,
          beneficiaryName: beneficiary.name,
          performedBy: `${user.firstName} ${user.lastName}`,
          performedByRole: role,
          quantity: item.quantity,
        })),
      });

      await tx.beneficiary.update({
        where: { id: beneficiaryId },
        data: { points: { decrement: totalPointCost } },
      });
    });

    return res.status(200).json({ message: "Reward released successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRewardReleases = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const rewardReleases = await prisma.rewardRelease.findMany({
      where: { barangayId },
      select: {
        id: true,
        rewardItem: {
          select: {
            name: true,
          },
        },
        program: {
          select: {
            name: true,
          },
        },
        quantity: true,
        beneficiaryName: true,
        performedBy: true,
        performedByRole: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetch reward releases successful", rewardReleases });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRewardSummary = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const [
      totalItems,
      totalReleasedResult,
      totalAddedResult,
      totalBeneficiaries,
    ] = await Promise.all([
      prisma.rewardItem.count({
        where: { barangayId },
      }),
      prisma.rewardRelease.aggregate({
        where: { barangayId },
        _sum: { quantity: true },
      }),
      prisma.rewardItem.aggregate({
        where: { barangayId },
        _sum: { quantity: true },
      }),
      prisma.rewardRelease.groupBy({
        by: ["beneficiaryId"],
        where: { barangayId, beneficiaryId: { not: null } },
        _count: { beneficiaryId: true },
      }),
    ]);

    const totalReleased = totalReleasedResult._sum.quantity ?? 0;

    const totalAdded = totalAddedResult._sum.quantity ?? 0;

    const totalAvailable = totalAdded - totalReleased;

    const distinctBeneficiaries = totalBeneficiaries.length;

    return res.status(200).json({
      message: "Fetch reward summary successful",
      totalItems,
      totalReleased,
      totalAdded,
      totalAvailable,
      distinctBeneficiaries,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getRewardItems, addRewardItem, releaseReward, getRewardReleases, getRewardSummary };
