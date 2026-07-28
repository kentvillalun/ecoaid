import express from 'express'
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"
import { addRewardItem, getRewardItems, getRewardReleases, getRewardSummary, releaseReward } from '../controllers/reward-inventory.controller.js'

const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getRewardItems )
router.post("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), addRewardItem )
router.post("/release", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), releaseReward )
router.get("/release", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getRewardReleases )
router.get("/summary", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getRewardSummary )

export default router;