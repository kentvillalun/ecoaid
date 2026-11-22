import express from "express"
import { deactivateResident, editResident, getBarangayInfo, getResidentProfile, getResidents, reactivateResident, searchResident, updateResidentProfile } from "../controllers/resident.controller.js"
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get("/me", authenticateResident, getResidentProfile)
router.patch("/me", authenticateResident, updateResidentProfile)
router.get("/barangay-info", authenticateResident, getBarangayInfo)
router.get("/search", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR", "SK"]), searchResident) // This is for manual intake transaction
router.get("/", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), getResidents)
router.patch("/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), editResident )
router.patch("/deactivate/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), deactivateResident)
router.patch("/reactivate/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), reactivateResident)

export default router