import { API_BASE_URL } from "./config";
import { isResidentPath } from "./residentRoutes";
import { BARANGAY_ROUTES, SUPER_ADMIN_ROUTES } from "./staffRoutes";

// Several requests can fail with 401 at the same time; only react once.
let isHandling = false;

const matches = (routes, path) =>
  routes.some((p) => path === p || path.startsWith(p + "/"));

// Which session the current page belongs to: its logout endpoint and login page.
const getSession = (path) => {
  if (matches(SUPER_ADMIN_ROUTES, path)) {
    return { logout: "/auth/admin/logout", login: "/admin/login", storageKey: "ecoaidAdminSession" };
  }
  if (matches(BARANGAY_ROUTES, path)) {
    return { logout: "/auth/barangay/logout", login: "/barangay/login", storageKey: "ecoaidBarangaySession" };
  }
  if (isResidentPath(path)) {
    return { logout: "/auth/logout", login: "/login", storageKey: "ecoaidResidentSession" };
  }
  return null;
};

// Called when the backend answers 401 (token expired, invalid, blacklisted, or
// the account was deleted/deactivated). The cookie is httpOnly, so JavaScript
// cannot delete it: we ask the backend's logout endpoint to clear it, then go
// to the matching login page.
//
// `body` is the parsed 401 response, when the caller has it. The page reload
// below wipes React state, so a ban message is handed to the login page
// through sessionStorage, which survives the reload.
export const handleUnauthorized = async (body) => {
  if (typeof window === "undefined") return;

  const session = getSession(window.location.pathname);
  if (!session) return;

  if (isHandling) return;
  isHandling = true;

  // Only residents get the notice: it is shown by the resident login page.
  if (body?.code === "ACCOUNT_DEACTIVATED" && session.login === "/login") {
    try {
      sessionStorage.setItem("authErrorMessage", body.error);
    } catch (error) {
      // storage blocked: the login page just won't show the notice
    }
  }

  try {
    await fetch(`${API_BASE_URL}${session.logout}`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // Backend unreachable. proxy.js still rejects expired or tampered cookies.
  }

  localStorage.removeItem(session.storageKey);

  // Full page load: clears all React state, and "replace" keeps the broken
  // page out of the back-button history.
  window.location.replace(session.login);
};
