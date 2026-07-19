import express from "express"
import { getBarangayInfo, getResidentProfile, getResidents, searchResident, updateResidentProfile } from "../controllers/resident.controller.js"
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get("/me", authenticateResident, getResidentProfile)
router.patch("/me", authenticateResident, updateResidentProfile)
router.get("/barangay-info", authenticateResident, getBarangayInfo)
router.get("/search", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR", "SK"]), searchResident)
router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getResidents)

export default router