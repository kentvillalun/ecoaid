import express from "express"
import { authenticateResident, authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { listRequests, pickupRequest, updateStatus, getRequest, getMyRequest, getMyRequestsById, cancelRequest } from "../controllers/pickup-request.controller.js"
import { classifyRecyclable } from "../controllers/image-recognition.controller.js"
import rateLimit from "express-rate-limit"

const router = express.Router()

const classifyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many requests, please try again shortly" }
})


router.post("/", authenticateResident, requireRoles(["RESIDENT"]), pickupRequest)
router.get("/collection-requests", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), listRequests)
router.get("/collection-requests/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), getRequest)
router.patch("/collection-requests/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), updateStatus)
router.get("/my-requests", authenticateResident, getMyRequest)
router.get("/my-requests/:id", authenticateResident, getMyRequestsById)
router.patch("/:id/cancel", authenticateResident, requireRoles(["RESIDENT"]), cancelRequest)
router.post("/classify", classifyLimiter, authenticateResident, requireRoles(["RESIDENT"]), classifyRecyclable)


export default router;