import express from "express"
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"
import { getLeaderboardStats, getResidentLeaderboardStats } from "../controllers/leaderboard.controller.js"

const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getLeaderboardStats)
router.get("/residents", authenticateResident, requireRoles(["RESIDENT"]), getResidentLeaderboardStats)


export default router;