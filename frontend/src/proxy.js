import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLE_MATRIX } from "./lib/roles";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request) {
  console.log("proxy running", request.nextUrl.pathname);
  const barangayToken = request.cookies.get("barangay_token");
  const residentToken = request.cookies.get("resident_token");
  const superAdminToken = request.cookies.get("admin_token");
  const pathname = request.nextUrl.pathname;

  const barangayRoutes = [
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
  const residentRoutes = [
    "/updates",
    "/capture",
    "/community",
    "/home",
    "/profile",
    "/requests",
    "/standings",
    "/notifications",
    "/",
  ];

  const superAdminRoutes = ["/admin-dashboard", "/barangay-accounts"];

  const isSuperAdminRoute = superAdminRoutes.some((superAdminRoutes) =>
    pathname.startsWith(superAdminRoutes),
  );

  const isBarangayRoute = barangayRoutes.some((barangayRoutes) =>
    pathname.startsWith(barangayRoutes),
  );

  const isResidentRoute = residentRoutes.some(
    (residentRoutes) =>
      pathname === residentRoutes || pathname.startsWith(residentRoutes + "/"),
  );

  if (isSuperAdminRoute && !superAdminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (isBarangayRoute && !barangayToken) {
    return NextResponse.redirect(new URL("/barangay/login", request.url));
  }

  if (isResidentRoute && !residentToken) {
    return NextResponse.redirect(new URL("/login", request.url));
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
