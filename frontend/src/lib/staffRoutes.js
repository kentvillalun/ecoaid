// Pages that require a barangay staff or super admin session.
// Used by proxy.js (server) and handleUnauthorized.js (browser), so both agree.
export const BARANGAY_ROUTES = [
  "/dashboard",
  "/collection-requests",
  "/redemption",
  "/manual-intake",
  "/mrf-inventory",
  "/junkshop-sales",
  "/settings",
  "/announcements",
  "/residents",
  "/reports",
];

export const SUPER_ADMIN_ROUTES = ["/admin-dashboard", "/barangay-accounts"];
