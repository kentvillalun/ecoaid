import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { exportReports, filterReports, listReportMaterials } from "../controllers/reports.controller.js"

const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK", "COLLECTOR"]), filterReports)
router.get("/materials", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK", "COLLECTOR"]), listReportMaterials)
router.post("/export", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK", "COLLECTOR"]), exportReports)

export default router;