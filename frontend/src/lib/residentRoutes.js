// Pages that require a logged-in resident.
// Used by proxy.js (server) and handleUnauthorized.js (browser), so both agree.
export const RESIDENT_ROUTES = [
  "/updates",
  "/capture",
  "/community",
  "/home",
  "/profile",
  "/requests",
  "/standings",
  "/notifications",
  "/programs",
  "/",
];

// "/home" and "/home/..." match, but "/homepage" does not.
export const isResidentPath = (pathname) =>
  RESIDENT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
