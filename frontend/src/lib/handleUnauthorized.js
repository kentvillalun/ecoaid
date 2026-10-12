import { API_BASE_URL } from "./config";
import { isResidentPath } from "./residentRoutes";

// Several requests can fail with 401 at the same time; only react once.
let isHandling = false;

// Called when the backend answers 401 (token expired, invalid or blacklisted).
// The cookie is httpOnly, so JavaScript cannot delete it: we ask the backend's
// logout endpoint to clear it, then go to /login.
export const handleUnauthorized = async () => {
  if (typeof window === "undefined") return;

  // Barangay and admin pages also use the shared hooks; leave them alone.
  if (!isResidentPath(window.location.pathname)) return;

  if (isHandling) return;
  isHandling = true;

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // Backend unreachable. proxy.js still rejects expired or tampered cookies.
  }

  localStorage.removeItem("ecoaidResidentSession");

  // Full page load: clears all React state, and "replace" keeps the broken
  // page out of the back-button history.
  window.location.replace("/login");
};
