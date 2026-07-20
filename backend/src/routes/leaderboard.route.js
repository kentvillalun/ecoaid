import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { getLeaderboardStats } from "../controllers/leaderboard.controller.js"

const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getLeaderboardStats)


export default router;