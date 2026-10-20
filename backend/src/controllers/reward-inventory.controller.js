import { prisma } from "../config/db.js";
import { getResidentProgramBalance } from "../utils/residentPoints.js";

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
    const { programId } = req.query;

    // the release modal only needs the items of the program it picked
    const where = { barangayId };
    if (programId) where.programId = programId;

    const items = await prisma.rewardItem.findMany({
      where,
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
    const { residentId, programId, items: requestedItems } = req.body ?? {};
    const { barangayId, id, role } = req.user;

    if (!residentId || !programId || !requestedItems) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // a zero or negative quantity would make the point cost zero or negative
    if (requestedItems.some((item) => !(item.quantity > 0))) {
      return res.status(400).json({ error: "Invalid reward quantity" });
    }

    // the same item picked in two rows counts as one line, so the stock and
    // point checks below run against the total, not each row on its own
    const items = Object.values(
      requestedItems.reduce((merged, item) => {
        const existing = merged[item.rewardItemId];
        merged[item.rewardItemId] = {
          rewardItemId: item.rewardItemId,
          quantity: (existing?.quantity ?? 0) + Number(item.quantity),
        };
        return merged;
      }, {}),
    );

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

    // every requested item has to belong to this program and this barangay
    const allItemsFound = items.every((item) =>
      rewardItems.some((r) => r.id === item.rewardItemId),
    );

    if (!allItemsFound) {
      return res
        .status(404)
        .json({ error: "Reward item not found in this program" });
    }

    const resident = await prisma.user.findUnique({
      where: { barangayId, id: residentId, role: "RESIDENT" },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
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
        .json({ error: "Not enough stock" });
    }

    const totalPointCost = items.reduce((total, item) => {
      const rewardItem = rewardItems.find((r) => r.id === item.rewardItemId);
      return total + rewardItem.pointCost * item.quantity;
    }, 0);

    // points are scoped per program, so eligibility must be checked against
    // the resident's balance in this program
    const programBalance = await getResidentProgramBalance(
      residentId,
      programId,
    );

    if (programBalance < totalPointCost) {
      return res.status(400).json({ error: "Not enough points" });
    }

    await prisma.rewardRelease.createMany({
      data: items.map((item) => ({
        rewardItemId: item.rewardItemId,
        residentId,
        programId,
        barangayId,
        residentName: `${resident.firstName} ${resident.lastName}`,
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

const searchResident = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, programId } = req.query;

    if (!programId) {
      return res.status(400).json({ error: "Program is required" });
    }

    // "juan dela" should match first name "Juan" + last name "Dela Cruz",
    // so every typed word must match either the first or the last name
    const words = (name ?? "").trim().split(/\s+/).filter(Boolean);

    // every resident shows up, even with 0 points, so staff can see why a
    // release isn't possible (the release itself checks the balance)
    const residents = await prisma.user.findMany({
      where: {
        barangayId,
        role: "RESIDENT",
        AND: words.map((word) => ({
          OR: [
            { firstName: { contains: word, mode: "insensitive" } },
            { lastName: { contains: word, mode: "insensitive" } },
          ],
        })),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      take: 10,
    });

    const residentsWithPoints = await Promise.all(
      residents.map(async (resident) => ({
        id: resident.id,
        name: `${resident.firstName} ${resident.lastName}`,
        points: await getResidentProgramBalance(resident.id, programId),
      })),
    );

    return res.status(200).json({
      message: "Searching residents successful",
      residents: residentsWithPoints,
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
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        rewardItem: {
          select: {
            name: true,
          },
        },
        programId: true,
        program: {
          select: {
            name: true,
          },
        },
        quantity: true,
        residentName: true,
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
      totalResidents,
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
        by: ["residentId"],
        where: { barangayId, residentId: { not: null } },
        _count: { residentId: true },
      }),
    ]);

    const totalReleased = totalReleasedResult._sum.quantity ?? 0;

    const totalAdded = totalAddedResult._sum.quantity ?? 0;

    const totalAvailable = totalAdded - totalReleased;

    const distinctResidents = totalResidents.length;

    return res.status(200).json({
      message: "Fetch reward summary successful",
      totalItems,
      totalReleased,
      totalAdded,
      totalAvailable,
      distinctResidents,
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
  searchResident,
};
