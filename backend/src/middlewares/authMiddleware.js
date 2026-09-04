import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const authenticateBarangay = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = req.cookies.barangay_token || authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      barangayId: decoded.barangayId,
    };

    const blackListed = await prisma.blackListedToken.findUnique({
      where: { token },
    });

    if (blackListed) {
      return res.status(401).json({ error: "Invalid token" });
    }

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

    req.user = {
      id: decode.id,
      role: decode.role,
      barangayId: decode.barangayId,
    };

    const blackListed = await prisma.blackListedToken.findUnique({
      where: { token },
    });

    if (blackListed) {
      return res.status(401).json({ error: "Invalid token" });
    }

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

    req.user = {
      id: decode.id,
      role: decode.role,
      barangayId: decode.barangayId,
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
