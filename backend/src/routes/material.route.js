import express from "express"
import { getCategories, getMaterials } from "../controllers/material.controller.js"
import { authenticateBarangay, authenticateResident, requireRoles } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get("/", authenticateResident, requireRoles(["RESIDENT"]), getMaterials)
router.get("/categories", authenticateResident, requireRoles(["RESIDENT"]), getCategories)



export default router