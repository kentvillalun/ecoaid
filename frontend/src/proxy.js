import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLE_MATRIX } from "./lib/roles";
import { isResidentPath } from "./lib/residentRoutes";
import { BARANGAY_ROUTES, SUPER_ADMIN_ROUTES } from "./lib/staffRoutes";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Returns the token payload if the resident cookie is valid, otherwise null.
// jwtVerify checks the signature AND the expiry (exp) for us.
async function getResidentPayload(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token.value, secret, {
      algorithms: ["HS256"],
    });

    if (payload.role !== "RESIDENT") return null;

    return payload;
  } catch (error) {
    return null;
  }
}

export async function proxy(request) {
  console.log("proxy running", request.nextUrl.pathname);
  const barangayToken = request.cookies.get("barangay_token");
  const residentToken = request.cookies.get("resident_token");
  const superAdminToken = request.cookies.get("admin_token");
  const pathname = request.nextUrl.pathname;

  const barangayRoutes = BARANGAY_ROUTES;

  const superAdminRoutes = SUPER_ADMIN_ROUTES;

  const isSuperAdminRoute = superAdminRoutes.some((superAdminRoutes) =>
    pathname.startsWith(superAdminRoutes),
  );

  const isBarangayRoute = barangayRoutes.some((barangayRoutes) =>
    pathname.startsWith(barangayRoutes),
  );

  const isResidentRoute = isResidentPath(pathname);

  if (isSuperAdminRoute && !superAdminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (isBarangayRoute && !barangayToken) {
    return NextResponse.redirect(new URL("/barangay/login", request.url));
  }

  const residentPayload = await getResidentPayload(residentToken);

  // Already logged in -> skip the login page
  if (pathname === "/login") {
    if (residentPayload) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // Not logged in: show the form, and throw away a bad cookie if there is one
    const response = NextResponse.next();
    if (residentToken) response.cookies.delete("resident_token");
    return response;
  }

  // Protected resident page without a valid token -> back to login, cookie removed
  if (isResidentRoute && !residentPayload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (residentToken) response.cookies.delete("resident_token");
    return response;
  }

  if (isSuperAdminRoute && superAdminToken) {
    try {
      const { payload } = await jwtVerify(superAdminToken.value, secret);
      
      if (payload.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/403", request.url))
      }

    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (isBarangayRoute && barangayToken) {
    try {
      const { payload } = await jwtVerify(barangayToken.value, secret);

      const matchedRoute = ROLE_MATRIX.find((entry) =>
        pathname.startsWith(entry.route),
      );

      if (matchedRoute === undefined) {
        return NextResponse.redirect(new URL("/403", request.url));
      }

      if (!matchedRoute.roles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/barangay/login", request.url));
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/collection-requests/:path*",
    "/redemption/:path*",
    "/announcements/:path*",
    "/updates/:path*",
    "/capture/:path*",
    "/community/:path*",
    "/home/:path*",
    "/profile/:path*",
    "/requests/:path*",
    "/standings/:path*",
    "/notifications/:path*",
    "/manual-intake/:path*",
    "/mrf-inventory/:path*",
    "/junkshop-sales/:path*",
    "/settings/:path*",
    "/residents/:path*",
    "/reports/:path*",
    "/admin-dashboard/:path*",
    "/barangay-accounts/:path*",
    
  ],
};
