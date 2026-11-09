import express from "express";
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"
import { addMaterial, getTheme, updateMaterialUnit, updateTheme } from "../controllers/settings.controller.js";

const router = express.Router()

router.get("/theme/staff", authenticateBarangay, requireRoles(["CAPTAIN", "SK", "SECRETARY", "TREASURER", "COLLECTOR"]), getTheme)
router.get("/theme/resident", authenticateResident, requireRoles(["RESIDENT"]), getTheme)
router.patch("/theme", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), updateTheme)
router.post("/materials", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), addMaterial)
router.patch("/materials/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), updateMaterialUnit)

export default router;