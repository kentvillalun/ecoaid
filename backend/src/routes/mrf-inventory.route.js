import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { getStockSummary, getTransactionLogs, recordStockOut } from "../controllers/mrf-inventory.controller.js"


const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(['CAPTAIN', 'SK', 'COLLECTOR', 'SECRETARY']), getStockSummary )
router.get("/transaction-logs", authenticateBarangay, requireRoles(['CAPTAIN', 'SK', 'COLLECTOR', 'SECRETARY']), getTransactionLogs)
router.post("/transaction-logs/out", authenticateBarangay, requireRoles(['CAPTAIN', 'SK', 'COLLECTOR', 'SECRETARY']), recordStockOut)

export default router