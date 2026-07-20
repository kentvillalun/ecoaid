import { prisma } from "../config/db.js";
import { getRankedLeaderboard } from "../utils/leaderboard.js";

const getLeaderboardStats = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const [weightLeaderboard, pieceLeaderboard] = await Promise.all([
      getRankedLeaderboard(barangayId, "KG"),
      getRankedLeaderboard(barangayId, "PIECE"),
    ]);

    return res.status(200).json({
      message: "Fetch leaderboard stats successful",
      weightLeaderboard,
      pieceLeaderboard,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getLeaderboardStats };
