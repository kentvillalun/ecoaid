// Photo-mismatch rules for the account ban (compliance matrix, item 5).
// The mismatch count itself is never stored: it is computed from
// PickupRequests.photoMismatch, so these two numbers are the only rule values.

// Mismatches that make a resident show up as flagged on the Residents page.
export const MISMATCH_FLAG_LIMIT = 3;

// After a ban is lifted the count starts again from zero, and the resident is
// flagged after this many mismatches instead (one strike on probation).
export const MISMATCH_PROBATION_LIMIT = 1;

// Counts a resident's mismatches and says whether they should be flagged.
// Collected and rejected pickups both count. Only pickups closed after the last ban was lifted (reactivatedAt) count,
// and a resident who has been reactivated is on the stricter probation limit.
// A deactivated resident is never flagged: they are already banned.
//
// `residents` needs { id, isActive, reactivatedAt }. One query covers all of
// them, then each resident is counted against their own reactivatedAt.
export const getMismatchStats = async (db, barangayId, residents) => {
  const mismatches = await db.pickupRequests.findMany({
    where: {
      barangayId,
      photoMismatch: true,
      status: { in: ["COLLECTED", "REJECTED"] },
      userId: { in: residents.map((resident) => resident.id) },
    },
    select: { userId: true, collectedAt: true, rejectedAt: true },
  });

  const stats = new Map();

  for (const resident of residents) {
    const since = resident.reactivatedAt;
    const mismatchCount = mismatches.filter(
      (pickup) =>
        pickup.userId === resident.id &&
        // a rejected pickup has no collectedAt, so it is dated by rejectedAt
        (!since || (pickup.collectedAt ?? pickup.rejectedAt) > since),
    ).length;
    const mismatchLimit = since ? MISMATCH_PROBATION_LIMIT : MISMATCH_FLAG_LIMIT;

    stats.set(resident.id, {
      mismatchCount,
      mismatchLimit,
      isFlagged: resident.isActive && mismatchCount >= mismatchLimit,
    });
  }

  return stats;
};

// The answer sent back right after a collector reports a mismatch: the
// resident's new count and whether it reached the limit, so the collector can
// be offered the ban straight away. Null when the resident cannot be found.
export const getMismatchAlert = async (db, barangayId, userId) => {
  const resident = await db.user.findFirst({
    where: { id: userId, barangayId, role: "RESIDENT" },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      isActive: true,
      reactivatedAt: true,
    },
  });

  if (!resident) return null;

  const stats = await getMismatchStats(db, barangayId, [resident]);
  const { mismatchCount, mismatchLimit, isFlagged } = stats.get(resident.id);

  return {
    resident: {
      id: resident.id,
      firstName: resident.firstName,
      middleName: resident.middleName,
      lastName: resident.lastName,
    },
    mismatchCount,
    mismatchLimit,
    isFlagged,
  };
};
