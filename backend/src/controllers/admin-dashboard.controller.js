import { prisma } from "../config/db.js";

const getOnboardingStatus = async (req, res) => {
  try {
    const stats = await prisma.barangay.findMany({
      select: {
        _count: {
          select: {
            sitios: true,
          },
        },
        name: true,
        id: true,
        users: {
          where: {
            role: { not: "RESIDENT" },
          },
          select: {
            role: true,
          },
        },
      },
    });

    const results = stats.map((barangay) => {
      const hasCaptain = barangay.users.some((u) => u.role === "CAPTAIN");
      const hasSecretary = barangay.users.some((u) => u.role === "SECRETARY");
      const hasTreasurer = barangay.users.some((u) => u.role === "TREASURER");
      const hasSk = barangay.users.some((u) => u.role === "SK");
      const hasCollector = barangay.users.some((u) => u.role === "COLLECTOR");

      const requiredRoles = [
        { name: "Captain", present: hasCaptain },
        { name: "Secretary", present: hasSecretary },
        { name: "Treasurer", present: hasTreasurer },
      ];

      const missingRoles = requiredRoles
        .filter((role) => !role.present)
        .map((role) => `Missing ${role.name} role`);

      const isIncomplete = missingRoles.length > 0 || barangay._count.sitios === 0;
      return {
        barangay: {
          name: barangay.name,
          id: barangay.id,
          sitioCount: barangay._count.sitios,
          roles: {
            hasCaptain,
            hasSecretary,
            hasTreasurer,
            hasSk,
            hasCollector,
          },
          missingRoles,
          isIncomplete
        },
      };
    });

    return res
      .status(200)
      .json({ message: "Onboarding stats fetched successfully", results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getOnboardingStatus };
