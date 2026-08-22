import { prisma } from "../config/db.js";
import { getBeneficiaryProgramBalance } from "../utils/beneficiaryPoints.js";

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
        programId: true,
        program: {
          select: {
            name: true,
          },
        },
        category: true,
        name: true,
        quantity: true,
        pointCost: true,
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
        programId: r.programId,
        programName: r.program.name,
        category: r.category,
        name: r.name,
        pointCost: r.pointCost,
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

    // points are scoped per program, so eligibility must be checked against
    // this program's balance, not the beneficiary's global running total
    const programBalance = await getBeneficiaryProgramBalance(
      beneficiaryId,
      programId,
    );

    if (programBalance < totalPointCost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    await prisma.rewardRelease.createMany({
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

    return res.status(200).json({ message: "Reward released successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const searchBeneficiary = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, programId } = req.query;

    if (!programId) {
      return res.status(400).json({ error: "Program is required" });
    }

    // a beneficiary can only spend points in a program they've actually
    // earned points in, so only surface beneficiaries with a redemption
    // transaction under this program
    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        barangayId,
        name: { contains: name, mode: "insensitive" },
        redemptionTransaction: {
          some: { programId },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const beneficiariesWithPoints = await Promise.all(
      beneficiaries.map(async (beneficiary) => ({
        ...beneficiary,
        points: await getBeneficiaryProgramBalance(beneficiary.id, programId),
      })),
    );

    return res.status(200).json({
      message: "Searching beneficiaries successful",
      beneficiaries: beneficiariesWithPoints,
    });
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

export {
  getRewardItems,
  addRewardItem,
  releaseReward,
  getRewardReleases,
  getRewardSummary,
  searchBeneficiary,
};
