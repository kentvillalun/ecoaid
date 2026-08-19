import { prisma } from "../config/db.js";

const getNotifications = async (req, res) => {
  try {
    const { id: userId, barangayId } = req.user;

    const cleanupThreshold = new Date();
    cleanupThreshold.setDate(cleanupThreshold.getDate() - 30);

    await prisma.notifications.deleteMany({
      where: {
        userId,
        isRead: true,
        createdAt: { lt: cleanupThreshold },
      },
    });

    const notifications = await prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        isRead: true,
        createdAt: true,
        pickupRequestId: true,
        pickupRequests: {
          select: {
            isAssorted: true,
            material: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const latestAnnouncement = await prisma.announcement.findFirst({
      where: { barangayId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastSeenAnnouncementAt: true },
    });

    const hasUnreadAnnouncements = latestAnnouncement
      ? !user.lastSeenAnnouncementAt ||
        latestAnnouncement.createdAt > user.lastSeenAnnouncementAt
      : false;

    await prisma.$transaction([
      prisma.notifications.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { lastSeenAnnouncementAt: new Date() },
      }),
    ]);

    return res.status(200).json({
      message: "Fetch notifications successful",
      notifications,
      hasUnreadAnnouncements,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUnreadStatus = async (req, res) => {
  try {
    const { id: userId, barangayId } = req.user;

    const [unreadNotification, latestAnnouncement, user] = await Promise.all([
      prisma.notifications.findFirst({
        where: { userId, isRead: false },
        select: { id: true },
      }),
      prisma.announcement.findFirst({
        where: { barangayId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { lastSeenAnnouncementAt: true },
      }),
    ]);

    const hasUnreadAnnouncements = latestAnnouncement
      ? !user.lastSeenAnnouncementAt ||
        latestAnnouncement.createdAt > user.lastSeenAnnouncementAt
      : false;

    const hasUnread = Boolean(unreadNotification) || hasUnreadAnnouncements;

    return res.status(200).json({
      message: "Fetch unread status successful",
      hasUnread,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getNotifications, getUnreadStatus };
