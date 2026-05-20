import { prisma } from "../config/db.js";

const getMaterials = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { categoryId } = req.query;

    const where = { barangayId, isActive: true };
    if (categoryId) where.categoryId = categoryId

    const materials = await prisma.material.findMany({
      where,
      select: {
        name: true,
        id: true,
        category: {
          select: {
            name: true
          }
        }
      },
    });

    return res.status(200).json({
      message: "Fetching materials succesfully",
      materials,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                name: true,
                id: true,
            }
        })

        return res.status(200).json({
            message: "Fetching categories successful",
            categories
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export { getMaterials, getCategories };
