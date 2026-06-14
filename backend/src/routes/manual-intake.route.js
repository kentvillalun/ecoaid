import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { getIntakeTransactions, recordIntake } from "../controllers/manual-intake.controller.js"


const router = express.Router()

router.post("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "COLLECTOR"]), recordIntake)
router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "COLLECTOR"]), getIntakeTransactions)


export default router