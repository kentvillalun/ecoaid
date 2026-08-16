import { prisma } from "../config/db.js";

const getBarangaySitios = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const sitios = await prisma.sitio.findMany({
      where: {
        barangayId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetch barangay sitos successful", sitios });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getBarangaySitios }
