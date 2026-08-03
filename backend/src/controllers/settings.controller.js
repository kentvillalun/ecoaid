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
    const { themeAccent } = req.body ?? {}

    const themes = ["FOREST_GREEN", "OCEAN_TEAL", "SUNRISE_ORANGE", "ROYAL_PURPLE", "DEEP_MAROON"]

    if (!themes.includes(themeAccent)) {
        return res.status(400).json({ error: "Invalid theme"})
    }

    await prisma.barangay.update({
        where: { id: barangayId },
        data:{
            themeAccent
        } 
    })


    return res.status(200).json({ message: "Theme updated successfully"})
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
};

export { getTheme, updateTheme };
