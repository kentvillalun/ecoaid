import { prisma } from "../config/db.js";

const getResidentProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        sitio: {
          select: {
            name: true,
          },
        },
        barangay: {
          select: {
            name: true,
            municipality: true,
            province: true,
          },
        },
        phoneNumber: true,
        address: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Fetching resident info success",
      user: {
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        sitio: user.sitio?.name,
        phoneNumber: user.phoneNumber,
        barangay: user.barangay.name,
        municipality: user.barangay.municipality,
        province: user.barangay.province,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBarangayInfo = async (req, res) => {
  try {
    const id = req.user.barangayId;

    const barangay = await prisma.barangay.findUnique({
      where: { id },
      select: {
        name: true,
        isRegistered: true,
        contactNumber: true,
        municipality: true,
        province: true,
        hasRedemptionManagement: true,
      },
    });

    if (!barangay) {
      return res.status(404).json({ error: "Barangay do not exist" });
    }

    return res.status(200).json({
      message: "Fetch barangay info sucessful",
      barangay,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// returns the name of the first field that was sent but is blank
const findBlankField = (fields) => {
  const blank = Object.entries(fields).find(
    ([, value]) =>
      value !== undefined && (typeof value !== "string" || !value.trim()),
  );
  return blank?.[0];
};

const updateResidentProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { firstName, middleName, lastName, phoneNumber, address } =
      req.body ?? {};

    const blankField = findBlankField({ firstName, lastName, phoneNumber });
    if (blankField) {
      return res.status(400).json({ error: `${blankField} cannot be empty` });
    }

    const data = {};
    if (firstName !== undefined) data.firstName = firstName.trim();
    if (middleName !== undefined) data.middleName = middleName?.trim() || null;
    if (lastName !== undefined) data.lastName = lastName.trim();
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber.trim();

    if (Object.keys(data).length === 0) {
      return res.status(400).json("Invalid request");
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    return res.status(200).json({
      message: "Update Successful",
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const searchResident = async (req, res) => {
  try {
    const barangayId = req.user.barangayId;
    const { name } = req.query;

    // staff are included too: barangay staff bring recyclables as their
    // attendance, and those have to be recorded against their own account
    const users = await prisma.$queryRaw`
      SELECT id, "firstName", "middleName", "lastName", "role"
      FROM "User"
      WHERE "barangayId" = ${barangayId} AND "isActive" = true AND (
        CONCAT_WS(' ', "firstName", NULLIF("middleName", ''), "lastName") ILIKE ${"%" + name + "%"}
        OR CONCAT("firstName", ' ', "lastName") ILIKE ${"%" + name + "%"}
      )
    `;

    return res.status(200).json({
      message: "Fetch success",
      users,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getResidents = async (req, res) => {
  try {
    const { barangayId, role } = req.user;

    const residents = await prisma.user.findMany({
      where: { barangayId, role: "RESIDENT" },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        address: true,
        purok: true,
        sitioId: true,
        isVerified: true,
        createdAt: true,
        isActive: true,
        deactivatedAt: true,
        deactivatedById: true,
        deactivatedByName: true,
        deactivatedByRole: true,
        reactivatedAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching residents successful", residents });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editResident = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      sitioId,
      isVerified,
    } = req.body ?? {};
    const { barangayId } = req.user;

    // the name and phone number can be changed but never left blank
    // middleName stays optional here: residents from before the field existed
    // have none, and the frontend forms are what ask for it
    const blankField = findBlankField({ firstName, lastName, phoneNumber });
    if (blankField) {
      return res.status(400).json({ error: `${blankField} cannot be empty` });
    }

    const data = {};
    if (firstName !== undefined) data.firstName = firstName.trim();
    if (middleName !== undefined) data.middleName = middleName?.trim() || null;
    if (lastName !== undefined) data.lastName = lastName.trim();
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber.trim();
    if (sitioId !== undefined) data.sitioId = sitioId;
    if (isVerified !== undefined) data.isVerified = isVerified;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (data.sitioId) {
      const sitio = await prisma.sitio.findUnique({
        where: {
          id: sitioId,
          barangayId,
        },
        select: {
          name: true,
        },
      });

      if (!sitio) {
        return res.status(400).json({ error: "Invalid sitio" });
      }

      data.purok = sitio.name;
    }

    const result = await prisma.user.updateMany({
      where: { id, barangayId },
      data,
    });

    if (result.count === 0) {
      return res.status(400).json({ error: "No resident record affected " });
    }

    return res
      .status(200)
      .json({ message: "Resident record updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deactivateResident = async (req, res) => {
  try {
    const { id, role, barangayId } = req.user;
    const residentId = req.params.id;

    const target = await prisma.user.findUnique({
      where: { barangayId, id: residentId, role: "RESIDENT" },
      select: {
        id: true,
        isActive: true,
        deactivatedAt: true,
      },
    });

    if (!target) {
      return res.status(404).json({ error: "Resident not found" });
    }

    if (!target.isActive) {
      return res.status(400).json({ error: "Already deactivated" });
    }

    const staff = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" })
    }

    await prisma.user.update({
      where: { id: target.id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedById: id,
        deactivatedByName: staff.middleName
          ? `${staff.firstName} ${staff.middleName} ${staff.lastName}`
          : `${staff.firstName} ${staff.lastName}`,
        deactivatedByRole: role,
      },
    });

    return res.status(200).json({ message: "Resident deactivated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const reactivateResident = async (req, res) => {
  try {
    const residentId = req.params.id;
    const { barangayId } = req.user;

    const target = await prisma.user.findUnique({ 
      where: {
        id: residentId,
        role: "RESIDENT",
        barangayId
      },
      select: {
        isActive: true,
        id: true
      }
    })

    if (!target) {
      return res.status(404).json({ error: "Resident not found" })
    }

    if (target.isActive) {
      return res.status(400).json({ error: "Resident is not deactivated" })
    }

    await prisma.user.update({
      where: {
        id: target.id,
      },
      data: {
        isActive: true,
        reactivatedAt: new Date(),
        deactivatedAt: null,
        deactivatedById: null,
        deactivatedByName: null,
        deactivatedByRole: null,
      }
    })

    return res.status(200).json({ message: "Resident reactivated" })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export {
  getResidentProfile,
  getBarangayInfo,
  updateResidentProfile,
  searchResident,
  getResidents,
  editResident,
  deactivateResident,
  reactivateResident
};
