import { prisma } from "../config/db.js";

export const addRewardItem = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, category, programId, quantity } = req.body ?? {};

    if (!programId || !name || !category || !quantity) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    await prisma.rewardItem.create({
      data: {
        programId,
        barangayId,
        category,
        name,
        quantity,
      },
    });

    return res
      .status(201)
      .json({ message: "Reward item has been added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRewardItems = async (req, res) => {
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
        return total + (current.quantity)
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
