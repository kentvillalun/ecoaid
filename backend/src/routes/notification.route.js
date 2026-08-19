import express from "express";
import { authenticateResident } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  getUnreadStatus,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authenticateResident, getNotifications);
router.get("/unread-status", authenticateResident, getUnreadStatus);

export default router;
