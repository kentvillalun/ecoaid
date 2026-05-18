// backend/src/controllers/auth.controller.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { sendOtp } from "../utils/sms.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value) => UUID_REGEX.test(value ?? "");

// ─────────────────────────────────────────────
// GET /auth/barangays?search=...
// Returns registered barangays matching the search term.
// Includes city so the frontend can show "Barangay — City"
// to distinguish barangays with the same name.
// ─────────────────────────────────────────────
const listBarangays = async (req, res) => {
  try {
    const search = req.query.search?.trim() ?? "";

    const barangays = await prisma.barangay.findMany({
      where: {
        isRegistered: true,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        name: true,
        municipality: true, // needed by frontend dropdown to distinguish same-name barangays
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return res.status(200).json({ status: "success", data: barangays });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /auth/barangays/:barangayId/sitios
// Returns all sitios belonging to a specific barangay.
// ─────────────────────────────────────────────
const listSitiosByBarangay = async (req, res) => {
  try {
    const { barangayId } = req.params;

    if (!isUuid(barangayId)) {
      return res.status(400).json({ error: "Invalid barangay ID" });
    }

    const barangay = await prisma.barangay.findFirst({
      where: { id: barangayId, isRegistered: true },
      select: { id: true },
    });

    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found" });
    }

    const sitios = await prisma.sitio.findMany({
      where: { barangayId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ status: "success", data: sitios });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/register
// Validates the signup data, sends an OTP to the phone number.
// Does NOT create the user yet — that happens in verifyOtp.
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      phoneNumber,
      barangayId,
      sitioId,
      password,
      confirmPassword,
      termsAccepted,
      username,
      lastName,
      firstName
    } = req.body ?? {};
    // ?? {} means "if req.body is null or undefined, use empty object"
    // prevents a crash when destructuring

    // ── Field presence check ──────────────────────────────────
    if (
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !barangayId ||
      !sitioId ||
      !username ||
      !lastName ||
      !firstName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ── UUID format check ─────────────────────────────────────
    // Never trust IDs from the frontend — validate format before
    // even touching the database
    if (!isUuid(barangayId) || !isUuid(sitioId)) {
      return res.status(400).json({ error: "Invalid address selection" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (termsAccepted !== true) {
      return res
        .status(400)
        .json({ error: "You must accept the Terms & Conditions" });
    }

    // ── Duplicate phone check ─────────────────────────────────
    const userExists = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: "This phone number is already registered" });
    }

    // Duplicate username check
    
    const usernameExist = await prisma.user.findUnique({
      where: { username },
    })

    if (usernameExist) {
      return res.status(400).json({error: "Username is already taken"})
    }


    // ── Validate barangay ─────────────────────────────────────
    const barangayRecord = await prisma.barangay.findFirst({
      where: { id: barangayId, isRegistered: true },
      select: { id: true, zipCode: true, name: true },
    });

    if (!barangayRecord) {
      return res.status(400).json({ error: "Barangay not found" });
    }

    // ── Validate sitio belongs to that barangay ───────────────
    // Important: someone could send a valid sitioId from a
    // completely different barangay. We verify the relationship.
    const sitioRecord = await prisma.sitio.findFirst({
      where: { id: sitioId, barangayId: barangayRecord.id },
      select: { id: true, name: true },
    });

    if (!sitioRecord) {
      return res.status(400).json({
        error: "Selected sitio does not belong to the selected barangay",
      });
    }

    // ── Clear any existing OTPs for this number ───────────────
    // Prevents multiple active OTPs for the same number
    // if the user tries to register more than once
    await prisma.otpVerification.deleteMany({
      where: { phoneNumber },
    });

    // ── Send OTP and save the returned code ───────────────────
    // sendOtp() handles generation — either via Semaphore (production)
    // or locally logged to terminal (dev mode, no API key)
    const code = await sendOtp(phoneNumber);

    // expiresAt = 10 minutes from now
    // Date.now() = current time in milliseconds
    // 10 * 60 * 1000 = 600,000ms = 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: { phoneNumber, code, expiresAt },
    });

    // User is NOT created yet — only after OTP is verified
    return res.status(200).json({
      status: "otp_sent",
      message: "Verification code sent to your phone number.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/verify-otp
// Confirms the OTP code, then creates the user.
// ─────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code, barangayId, sitioId, password, termsAccepted, username, lastName, firstName } =
      req.body ?? {};

    if (!phoneNumber || !code || !username || !lastName || !firstName) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    // ── Find a valid OTP record ───────────────────────────────
    // Checks all three at once:
    // 1. phoneNumber matches
    // 2. code matches exactly
    // 3. expiresAt is still in the future (gt = greater than now)
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    // ── Re-validate address data ──────────────────────────────
    // We validate again even though register() already did it.
    // The user could have tampered with sessionStorage between steps.
    // Backend never trusts data just because it saw it before.
    if (!isUuid(barangayId) || !isUuid(sitioId)) {
      return res.status(400).json({ error: "Invalid address selection" });
    }

    const barangayRecord = await prisma.barangay.findFirst({
      where: { id: barangayId, isRegistered: true },
      select: { id: true, zipCode: true, name: true },
    });

    if (!barangayRecord) {
      return res.status(400).json({ error: "Barangay not found" });
    }

    const sitioRecord = await prisma.sitio.findFirst({
      where: { id: sitioId, barangayId: barangayRecord.id },
      select: { id: true, name: true },
    });

    if (!sitioRecord) {
      return res.status(400).json({ error: "Invalid sitio selection" });
    }

    // ── Hash password and create the user ─────────────────────
    // bcrypt.hash(password, 10) — 10 is the salt rounds.
    // A salt is random data added before hashing so two users
    // with the same password still get different hashes.
    // 10 is the industry standard balance of security vs speed.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        purok: sitioRecord.name,
        passwordHash: hashedPassword,
        barangay: { connect: { id: barangayRecord.id } },
        sitio: { connect: { id: sitioRecord.id } },
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        username,
        lastName,
        firstName,
      },
      select: {
        id: true,
        phoneNumber: true,
        purok: true,
        barangay: { select: { id: true, zipCode: true, name: true } },
        sitio: { select: { id: true, name: true } },
      },
    });

    // ── Delete the used OTP ───────────────────────────────────
    // Prevents the same code from being used twice
    await prisma.otpVerification.delete({
      where: { id: otpRecord.id },
    });

    return res.status(201).json({ status: "success", data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/resend-otp
// Deletes the old OTP and sends a fresh one.
// The 60-second cooldown is enforced on the frontend.
// Accepts an optional otpFlow field ("signup" | "forgot-password").
// The user-existence check is flipped between flows:
//   - signup: user must NOT exist yet
//   - forgot-password: user MUST exist (they're resetting their password)
// ─────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { phoneNumber, otpFlow = "signup" } = req.body ?? {};

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const userExists = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (otpFlow === "forgot-password") {
      // For password reset, the user must have an account to resend to
      if (!userExists) {
        return res
          .status(400)
          .json({ error: "No account found for this phone number" });
      }
    } else {
      // For signup, the phone must not already be registered
      if (userExists) {
        return res
          .status(400)
          .json({ error: "This phone number is already registered" });
      }
    }

    // Delete old OTP and generate a fresh one
    await prisma.otpVerification.deleteMany({
      where: { phoneNumber },
    });

    const code = await sendOtp(phoneNumber);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: { phoneNumber, code, expiresAt },
    });

    return res.status(200).json({
      status: "otp_sent",
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        barangay: { select: { id: true, name: true, zipCode: true } },
        sitio: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "This account is inactive" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role,
      barangayId: user.barangayId,
    });

    res.cookie("resident_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? "none" : "lax",
      sameSite: "none",
      maxAge: 604800000,
    });

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        role: user.role,
        username: user.username,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        barangay: user.barangay,
        sitio: user.sitio,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/forgot-password
// Checks the phone number exists, then sends an OTP.
// Does NOT change the password yet — that happens after OTP is verified.
// ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { phoneNumber } = req.body ?? {};

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Only registered users can reset their password
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: { id: true, isActive: true },
    });

    if (!user) {
      // Return the same message whether or not the account exists.
      // This prevents attackers from using this endpoint to check
      // which phone numbers are registered.
      return res.status(200).json({
        status: "otp_sent",
        message: "If an account exists for this number, a code has been sent.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "This account is inactive" });
    }

    // Clear any existing OTPs for this number before sending a new one
    await prisma.otpVerification.deleteMany({
      where: { phoneNumber },
    });

    const code = await sendOtp(phoneNumber);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: { phoneNumber, code, expiresAt },
    });

    return res.status(200).json({
      status: "otp_sent",
      message: "If an account exists for this number, a code has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/verify-forgot-password-otp
// Validates the OTP sent during forgot-password flow.
// On success, generates a short-lived reset token and returns it.
// The token is used in the next step (/auth/reset-password).
// ─────────────────────────────────────────────
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body ?? {};

    if (!phoneNumber || !code) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP code are required" });
    }

    // Find a valid, unexpired OTP for this phone number
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    // Delete the used OTP so it can't be reused
    await prisma.otpVerification.delete({
      where: { id: otpRecord.id },
    });

    // Clear any old reset tokens for this number before creating a new one.
    // Prevents multiple active tokens if the user runs the flow more than once.
    await prisma.passwordResetToken.deleteMany({
      where: { phoneNumber },
    });

    // Generate a cryptographically secure random token.
    // crypto.randomBytes(32) gives 32 bytes of random data.
    // .toString("hex") turns it into a 64-character hex string.
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 15 minutes — enough time to fill the reset form
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { phoneNumber, token, expiresAt },
    });

    return res.status(200).json({ status: "success", data: { token } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/reset-password
// Validates the reset token, then updates the user's password.
// Deletes the token after use so it cannot be replayed.
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, phoneNumber, password, confirmPassword } = req.body ?? {};

    if (!token || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Find the reset token and verify it belongs to this phone number
    // and hasn't expired
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        phoneNumber,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset link. Please start over." });
    }

    // Hash the new password with the same settings as registration
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { phoneNumber },
      data: { passwordHash: hashedPassword },
    });

    // Delete the token after use — one-time use only
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Barangay Login Authentication

export const BARANGAY_ROLES = [
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "SK",
  "COLLECTOR",
];

const barangayLogin = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    //  Valide both field
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by phone number in the database
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        barangay: { select: { id: true, name: true, zipCode: true } },
      },
    });

    // If the user not found -> return error
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    // Compare password with the hashed password using bcrypt
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    // If password wrong -> return error
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    // Check if user role is a barangay role

    if (!BARANGAY_ROLES.includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to barangay portal" });
    }

    // If not active -> return error
    if (!user.isActive) {
      return res.status(403).json({ error: "This account is inactive" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role,
      barangayId: user.barangayId,
    });

    res.cookie("barangay_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? "none" : "lax",
      sameSite: "none",
      maxAge: 604800000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        barangay: user.barangay,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const logoutBarangay = async (req, res) => {
  try {
    const token = req.cookies.barangay_token;

    if (!token) {
      res.clearCookie("barangay_token");
      return res.status(200).json({ message: "User already logged out" });
    }

    const decode = jwt.decode(token);
    const expiresAt = new Date(decode.exp * 1000);

    await prisma.blackListedToken.create({
      data: {
        token,
        expiresAt,
      },
    });

    res.clearCookie("barangay_token");

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const { id, role, barangayId } = req.user ?? {};

    const user = await prisma.user.findUnique({
      where: { id },
      include: { sitio: { select: { name: true } } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found"})
    }
  
    return res.status(200).json({
      message: "Verification successful",
      user: {
        id,
        role,
        barangayId, 
        sitio: user.sitio
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logoutResident = async (req, res) => {
  try {
    const token = req.cookies.resident_token;

    if (!token) {
      res.clearCookie("resident_token");
      return res.status(200).json({ message: "User already logged out" });
    }

    const decode = jwt.decode(token);
    const expiresAt = new Date(decode.exp * 1000);

    await prisma.blackListedToken.create({
      data: {
        token,
        expiresAt,
      },
    });

    res.clearCookie("resident_token");

    return res.status(200).json({
      message: "Logout succesful",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  listBarangays,
  listSitiosByBarangay,
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  barangayLogin,
  logoutBarangay,
  me,
  logoutResident,
};
