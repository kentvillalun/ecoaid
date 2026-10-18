import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

// The token can outlive the account: make sure the user still exists and is active.
// Sends the 401 itself and returns null when the session must be rejected.
const loadActiveUser = async (id, cookieName, res) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, barangayId: true, isActive: true },
  });

  if (!user || !user.isActive) {
    res.clearCookie(cookieName);
    res.status(401).json({ error: "Account not found", code: "ACCOUNT_NOT_FOUND" });
    return null;
  }

  return user;
};

const authenticateBarangay = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = req.cookies.barangay_token || authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const blackListed = await prisma.blackListedToken.findUnique({
      where: { token },
    });

    if (blackListed) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await loadActiveUser(decoded.id, "barangay_token", res);
    if (!user) return;

    req.user = {
      id: user.id,
      role: user.role,
      barangayId: user.barangayId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const authenticateResident = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = req.cookies.resident_token || authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const blackListed = await prisma.blackListedToken.findUnique({
      where: { token },
    });

    if (blackListed) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await loadActiveUser(decode.id, "resident_token", res);
    if (!user) return;

    req.user = {
      id: user.id,
      role: user.role,
      barangayId: user.barangayId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Authorization denied" });
    }
    next();
  };
};

const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = req.cookies.admin_token || authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (decode.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Invalid role" });
    }

    const blackListed = await prisma.blackListedToken.findUnique({
      where: { token },
    });

    if (blackListed) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await loadActiveUser(decode.id, "admin_token", res);
    if (!user) return;

    req.user = {
      id: user.id,
      role: user.role,
      barangayId: user.barangayId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export { authenticateResident, requireRoles, authenticateBarangay, authenticateSuperAdmin };
