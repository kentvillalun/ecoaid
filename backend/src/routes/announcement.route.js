import express from "express";
import {
  authenticateBarangay,
  authenticateResident,
  requireRoles,
} from "../middlewares/authMiddleware.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getLatestAnnouncements,
  getResidentAnnouncements,
} from "../controllers/announcement.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticateBarangay,
  requireRoles(["CAPTAIN", "SECRETARY", "SK"]),
  createAnnouncement,
);
router.get(
  "/",
  authenticateBarangay,
  requireRoles(["CAPTAIN", "SECRETARY", "SK"]),
  getAnnouncements,
);
router.delete(
  "/:announcementId",
  authenticateBarangay,
  requireRoles(["CAPTAIN", "SECRETARY", "SK"]),
  deleteAnnouncement,
);
router.get("/residents", authenticateResident, getResidentAnnouncements);
router.get("/residents/latest", authenticateResident, getLatestAnnouncements)

export default router;
