import express from "express"
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { addJunkshop, getJunkshopDetails, getJunkshops, getJunkshopSales, getJunkshopWithPrices, recordSale } from "../controllers/junkshop-sales.controller.js"

const router = express.Router()

// router.post("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), recordSale)
// router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getJunkshopSales)
// router.get("/prices", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER"]), getJunkshopWithPrices)
// router.post("/junkshop", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), addJunkshop)
// router.get("/junkshop/:junkshopId", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getJunkshopDetails)
// router.get("/junkshop", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), getJunkshops)

router.post("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER"]), recordSale)
router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER"]), getJunkshopSales)
router.get("/prices", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getJunkshopWithPrices)
router.post("/junkshop", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER"]), addJunkshop)
router.get("/junkshop/:junkshopId", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER"]), getJunkshopDetails)
router.get("/junkshop", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), getJunkshops)

export default router