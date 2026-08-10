import { prisma } from "../config/db.js";

const getTheme = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const theme = await prisma.barangay.findUnique({
      where: { id: barangayId },
      select: {
        themeAccent: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetch barangay theme successful", theme });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { themeAccent } = req.body ?? {};

    const themes = [
      "FOREST_GREEN",
      "OCEAN_TEAL",
      "SUNRISE_ORANGE",
      "ROYAL_PURPLE",
      "DEEP_MAROON",
    ];

    if (!themes.includes(themeAccent)) {
      return res.status(400).json({ error: "Invalid theme" });
    }

    await prisma.barangay.update({
      where: { id: barangayId },
      data: {
        themeAccent,
      },
    });

    return res.status(200).json({ message: "Theme updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const addMaterial = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, categoryId, defaultUnit } = req.body ?? {};

    if (!name || !categoryId || !defaultUnit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isExist = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!isExist) {
      return res.status(400).json({ error: "Invalid category " });
    }

    const material = await prisma.material.create({
      data: {
        name: name.trim(),
        categoryId,
        barangayId,
        defaultUnit,
      },
    });

    return (res.status(201).json({ message: "Material added", material }));
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A material with this name already exists"})
    }
    return res.status(500).json({ error: error.message });
  }
};

export { getTheme, updateTheme, addMaterial };
