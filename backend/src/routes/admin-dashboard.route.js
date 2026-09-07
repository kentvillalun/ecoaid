import express from "express"
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js"
import { getOnboardingStatus } from "../controllers/admin-dashboard.controller.js"

const router = express.Router()

router.get("/onboarding-status", authenticateSuperAdmin, getOnboardingStatus)

export default router;