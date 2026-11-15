import express from 'express'    
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js"
import { createSitio, editBarangay, editSitios, getBarangayDetails, getBarangays, getSitios, getStaffAccountsByBarangay, registerBarangay, registerStaffAccount, updateStaffStatus } from "../controllers/barangay-accounts.controller.js"

const router = express.Router()

router.get("/barangays", authenticateSuperAdmin, getBarangays)
router.post("/barangay/register", authenticateSuperAdmin, registerBarangay)
router.patch("/barangay/:id", authenticateSuperAdmin, editBarangay)
router.get("/barangays/:id", authenticateSuperAdmin, getBarangayDetails)
router.post("/barangays/:id/staff", authenticateSuperAdmin, registerStaffAccount)
router.get("/barangays/:id/staff", authenticateSuperAdmin, getStaffAccountsByBarangay)
router.patch("/barangays/:id/staff/:staffId", authenticateSuperAdmin, updateStaffStatus)
router.post("/barangays/:id/sitios", authenticateSuperAdmin, createSitio)
router.get("/barangays/:id/sitios", authenticateSuperAdmin, getSitios)
router.patch("/sitios/:id", authenticateSuperAdmin, editSitios)

export default router