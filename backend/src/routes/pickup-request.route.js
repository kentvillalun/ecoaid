import express from "express"
import { authenticateResident, authenticateBarangay, requireRoles } from "../middlewares/authMiddleware.js"
import { listRequests, pickupRequest, updateStatus, getRequest, getMyRequest, getMyRequestsById, cancelRequest } from "../controllers/pickup-request.controller.js"

const router = express.Router()


router.post("/", authenticateResident, requireRoles(["RESIDENT"]), pickupRequest)
router.get("/collection-requests", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), listRequests)
router.get("/collection-requests/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), getRequest)
router.patch("/collection-requests/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "COLLECTOR"]), updateStatus)
router.get("/my-requests", authenticateResident, getMyRequest)
router.get("/my-requests/:id", authenticateResident, getMyRequestsById)
router.patch("/:id/cancel", authenticateResident, requireRoles(["RESIDENT"]), cancelRequest)


export default router;