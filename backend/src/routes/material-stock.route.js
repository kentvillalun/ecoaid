import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { getStockSummary } from "../controllers/material-stock.controller.js"


const router = express.Router()

router.get("/", authenticateBarangay, requireRoles(['CAPTAIN', 'SK', 'COLLECTOR', 'SECRETARY']), getStockSummary )

export default router