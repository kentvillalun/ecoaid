import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { BARANGAY_ROLES } from "./auth.controller.js";

const getBarangays = async (req, res) => {
  try {
    const barangays = await prisma.barangay.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        name: true,
        municipality: true,
        province: true,
        contactNumber: true,
        createdAt: true,
        hasCollectionRequests: true,
        hasLeaderboard: true,
        hasRedemptionManagement: true,
        hasRewardInventory: true,
        id: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Barangays fetched successful", barangays });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const registerBarangay = async (req, res) => {
  try {
    const {
      name,
      municipality,
      province,
      zipCode,
      contactNumber,
      themeAccent,
      hasCollectionRequests,
      hasRedemptionManagement,
      hasRewardInventory,
      hasLeaderboard,
    } = req.body ?? {};

    if (
      !name ||
      !municipality ||
      !province ||
      !zipCode ||
      !contactNumber ||
      !themeAccent
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingZip = await prisma.barangay.findFirst({ where: { zipCode } });
    if (existingZip) {
      return res
        .status(400)
        .json({ error: "A barangay with this zip code is already registered" });
    }

    const existingContact = await prisma.barangay.findFirst({
      where: { contactNumber },
    });
    if (existingContact) {
      return res.status(400).json({
        error: "A barangay with this contact number is already registered",
      });
    }

    await prisma.barangay.create({
      data: {
        name,
        municipality,
        province,
        zipCode,
        contactNumber,
        themeAccent,
        hasCollectionRequests,
        hasRedemptionManagement,
        hasRewardInventory,
        hasLeaderboard,
      },
    });

    return res.status(201).json({ message: "Barangay registered successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editBarangay = async (req, res) => {
  try {
    const {
      name,
      municipality,
      province,
      zipCode,
      contactNumber,
      themeAccent,
      hasCollectionRequests,
      hasRedemptionManagement,
      hasRewardInventory,
      hasLeaderboard,
    } = req.body ?? {};
    const { id } = req.params;

    const data = {};
    if (name !== undefined) data.name = name;
    if (municipality !== undefined) data.municipality = municipality;
    if (province !== undefined) data.province = province;
    if (zipCode !== undefined) data.zipCode = zipCode;
    if (contactNumber !== undefined) data.contactNumber = contactNumber;
    if (themeAccent !== undefined) data.themeAccent = themeAccent;
    if (hasCollectionRequests !== undefined)
      data.hasCollectionRequests = hasCollectionRequests;
    if (hasRedemptionManagement !== undefined)
      data.hasRedemptionManagement = hasRedemptionManagement;
    if (hasRewardInventory !== undefined)
      data.hasRewardInventory = hasRewardInventory;
    if (hasLeaderboard !== undefined) data.hasLeaderboard = hasLeaderboard;

    if (data.zipCode) {
      const existingZip = await prisma.barangay.findFirst({
        where: { zipCode: data.zipCode, id: { not: id } },
      });
      if (existingZip) {
        return res.status(400).json({
          error: "A barangay with this zip code is already registered",
        });
      }
    }

    if (data.contactNumber) {
      const existingContact = await prisma.barangay.findFirst({
        where: { contactNumber: data.contactNumber, id: { not: id } },
      });
      if (existingContact) {
        return res.status(400).json({
          error: "A barangay with this contact number is already registered",
        });
      }
    }

    await prisma.barangay.update({
      where: { id },
      data,
    });

    return res
      .status(200)
      .json({ message: "Barangay records updated successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBarangayDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const barangay = await prisma.barangay.findUnique({
      where: { id },
      select: {
        name: true,
        municipality: true,
        province: true,
        zipCode: true,
        contactNumber: true,
        themeAccent: true,
        hasCollectionRequests: true,
        hasRedemptionManagement: true,
        hasRewardInventory: true,
        hasLeaderboard: true,
        createdAt: true,
      },
    });

    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found" });
    }

    return res
      .status(200)
      .json({ message: "Barangay details fetched successful", barangay });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const registerStaffAccount = async (req, res) => {
  try {
    const { username, password, firstName, lastName, phoneNumber, role } =
      req.body ?? {};
    const { id } = req.params;

    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !role
    ) {
      return res.status(400).json({ error: "Missing required field" });
    }

    if (!BARANGAY_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: "This username is already taken" });
    }

    const existingContact = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingContact) {
      return res
        .status(400)
        .json({ error: "This contact number is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role,
        barangayId: id,
      },
    });

    return res
      .status(201)
      .json({ message: "Staff account registered successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getStaffAccountsByBarangay = async (req, res) => {
  try {
    const { id } = req.params;

    const accounts = await prisma.user.findMany({
      where: { barangayId: id, role: { not: "RESIDENT" } },
      orderBy: { role: "asc" },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ message: "Barangay staff accounts fetched successful", accounts})
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  getBarangays,
  registerBarangay,
  editBarangay,
  getBarangayDetails,
  registerStaffAccount,
  getStaffAccountsByBarangay
};
