import { prisma } from "../config/db.js";

const getResidentProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        barangay: {
          select: {
            name: true,
            municipality: true,
            province: true,
          },
        },
        sitio: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Fetching resident info success",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        sitio: user.sitio?.name,
        phoneNumber: user.phoneNumber,
        barangay: user.barangay.name,
        municipality: user.barangay.municipality,
        province: user.barangay.province,
        address: user.address,
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

const updateResidentProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { firstName, lastName, phoneNumber, address } = req.body ?? {};

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;

    if (Object.keys(data).length === 0) {
      return res.status(400).json("Invalid request");
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        firstName: true,
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

    // const users = await prisma.user.findMany({
    //   where: {
    //     barangayId,
    //     role: "RESIDENT",
    //     OR: [
    //       {
    //         firstName: {
    //           contains: name,
    //           mode: "insensitive",
    //         },
    //       },
    //       {
    //         lastName: {
    //           contains: name,
    //           mode: "insensitive",
    //         },
    //       },
    //     ],
    //   },
    //   select: {
    //     id: true,
    //     firstName: true,
    //     lastName: true,
    //   },
    // });
    const users = await prisma.$queryRaw`
      SELECT id, "firstName", "lastName"
      FROM "User"
      WHERE "barangayId" = ${barangayId} AND "role" = 'RESIDENT' AND CONCAT("firstName", ' ', "lastName") ILIKE ${'%' + name + '%'}
    `

    return res.status(200).json({
      message: "Fetch success",
      users,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getResidentProfile, getBarangayInfo, updateResidentProfile, searchResident };
