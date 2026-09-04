import express from 'express'    
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js"
import { editBarangay, getBarangayDetails, getBarangays, getStaffAccountsByBarangay, registerBarangay, registerStaffAccount } from "../controllers/barangay-accounts.controller.js"

const router = express.Router()

router.get("/barangays", authenticateSuperAdmin, getBarangays)
router.post("/barangay/register", authenticateSuperAdmin, registerBarangay)
router.patch("/barangay/:id", authenticateSuperAdmin, editBarangay)
router.get("/barangays/:id", authenticateSuperAdmin, getBarangayDetails)
router.post("/barangays/:id/staff", authenticateSuperAdmin, registerStaffAccount)
router.get("/barangays/:id/staff", authenticateSuperAdmin, getStaffAccountsByBarangay)

export default router