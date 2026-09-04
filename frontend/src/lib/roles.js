export const BARANGAY_ROLES = [
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "SK",
  "COLLECTOR",
];

export const ROLE_MATRIX = [
  { route: "/dashboard", roles: ["CAPTAIN", "SECRETARY"] },
  { route: "/collection-requests", roles: ["CAPTAIN", "SECRETARY", "COLLECTOR"] },
  { route: "/manual-intake", roles: ["CAPTAIN", "SECRETARY", "COLLECTOR", "SK"] },
  { route: "/residents", roles: ["CAPTAIN", "SECRETARY"] },
  { route: "/mrf-inventory", roles: ["CAPTAIN", "SECRETARY", "SK", "COLLECTOR"] },
  { route: "/redemption", roles: ["CAPTAIN", "SECRETARY", "SK", "TREASURER"] },
  { route: "/reward-inventory", roles: ["CAPTAIN", "SECRETARY", "TREASURER", "SK"] },
  { route: "/junkshop-sales", roles: ["CAPTAIN", "SECRETARY", "TREASURER"] },
  { route: "/program-funds", roles: ["CAPTAIN", "SECRETARY", "TREASURER", "SK"] },
  { route: "/announcements", roles: ["CAPTAIN", "SECRETARY", "SK"] },
  { route: "/leaderboard", roles: ["CAPTAIN", "SECRETARY", "SK", "TREASURER"] },
  { route: "/reports", roles: ["CAPTAIN", "SECRETARY", "TREASURER", "SK", "COLLECTOR"] },
  { route: "/settings", roles: ["CAPTAIN", "SECRETARY"] },
];