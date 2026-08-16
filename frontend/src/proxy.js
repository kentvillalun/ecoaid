import { NextResponse } from "next/server";

export function proxy(request) {
  console.log("proxy running", request.nextUrl.pathname);
  const barangayToken = request.cookies.get("barangay_token");
  const residentToken = request.cookies.get("resident_token");
  const pathname = request.nextUrl.pathname;

  const barangayRoutes = ["/dashboard", "/collection-requests", "/redemption", "/manual-intake", "/material-stock", "/junkshop-sales", "/settings", "/announcements", "/residents", "/reports"];
  const residentRoutes = [
    "/updates",
    "/capture",
    "/community",
    "/home",
    "/profile",
    "/requests",
    "/standings",
    "/",
  ];

  const isBarangayRoute = barangayRoutes.some((barangayRoutes) =>
    pathname.startsWith(barangayRoutes),
  );

  const isResidentRoute = residentRoutes.some((residentRoutes) => pathname === residentRoutes || pathname.startsWith(residentRoutes + "/"),
  );


  if (isBarangayRoute && !barangayToken) {
    return NextResponse.redirect(new URL("/barangay/login", request.url));
  }

  if (isResidentRoute && !residentToken) {
    return NextResponse.redirect(new URL("/login", request.url));
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
    "/manual-intake/:path*",
    "/material-stock/:path*",
    "/junkshop-sales/:path*",
    "/settings/:path*",
    "/residents/:path*",
    "/reports/:path*",
  ],
};
