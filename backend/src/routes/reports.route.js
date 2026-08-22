import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { filterReports } from "../controllers/reports.controller.js"

const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK", "COLLECTOR"]), filterReports)

export default router;