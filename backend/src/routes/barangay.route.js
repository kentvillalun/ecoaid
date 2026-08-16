import express from 'express'
import { authenticateBarangay, requireRoles } from '../middlewares/authMiddleware.js'
import { getBarangaySitios } from '../controllers/barangay.controller.js'

const router = express.Router()

router.get("/sitio", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY"]), getBarangaySitios)

export default router