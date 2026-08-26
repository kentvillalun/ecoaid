import express from "express";
import { authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js";
import { getDashboardStats, getRecentTransactions } from "../controllers/dashboard.controller.js";


const router = express.Router();

router.get("/", authenticateBarangay, requireRoles(['CAPTAIN', 'SECRETARY']), getDashboardStats)
router.get("/recent-transactions", authenticateBarangay, requireRoles(['CAPTAIN', 'SECRETARY']), getRecentTransactions)


export default router;