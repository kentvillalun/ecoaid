import { prisma } from "../config/db.js";

const createAnnouncement = async (req, res) => {
  try {
    const { barangayId, id, role } = req.user;
    const { title, content, category } = req.body ?? {};

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    await prisma.announcement.create({
      data: {
        barangayId,
        userId: id,
        title,
        content,
        category,
        performedBy: `${user.firstName} ${user.lastName}`,
        performedByRole: role,
      },
    });

    return res
      .status(201)
      .json({ message: "Announcement created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const announcements = await prisma.announcement.findMany({
      where: { barangayId },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        performedBy: true,
        performedByRole: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetch announcements successful", announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement does not exist" });
    }

    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    return res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getResidentAnnouncements = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const announcements = await prisma.announcement.findMany({
      where: { barangayId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching annoucements successful", announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getResidentAnnouncements,
};
