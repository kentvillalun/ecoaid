import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { addJunkshop, getJunkshopSales, getJunkshopWithPrices, recordSale } from "../controllers/junkshop-sales.controller.js"

const router = express.Router()

router.post("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), recordSale)
router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getJunkshopSales)
router.get("/prices", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getJunkshopWithPrices)
router.post("/junkshop", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), addJunkshop)

export default router