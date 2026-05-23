import express from 'express';
import {
  listBarangays,
  listSitiosByBarangay,
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  barangayLogin,
  logoutBarangay,
  me,
  logoutResident,
  barangayMe,
} from "../controllers/auth.controller.js";
import { authenticateResident, authenticateBarangay } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/barangays", listBarangays);
router.get("/barangays/:barangayId/sitios", listSitiosByBarangay);
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.post("/barangay/login", barangayLogin);
router.post("/barangay/logout", logoutBarangay);
router.get("/me", authenticateResident, me);
router.get("/barangay/me", authenticateBarangay, barangayMe);
router.post("/logout", logoutResident)

export default router;
