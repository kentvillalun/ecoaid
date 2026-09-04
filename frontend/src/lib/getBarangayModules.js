// utils/getBarangayModules.js (or wherever your shared frontend utils live)

export function getBarangayModules(barangay) {
  return [
    { label: "Collection Requests", enabled: barangay?.hasCollectionRequests },
    { label: "Redemption Management", enabled: barangay?.hasRedemptionManagement },
    { label: "Reward Inventory", enabled: barangay?.hasRewardInventory },
    { label: "Leaderboard", enabled: barangay?.hasLeaderboard },
  ];
}