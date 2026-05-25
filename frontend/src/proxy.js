import { NextResponse } from "next/server";

export function proxy(request) {
  console.log("proxy running", request.nextUrl.pathname);
  const barangayToken = request.cookies.get("barangay_token");
  const residentToken = request.cookies.get("resident_token");
  const pathname = request.nextUrl.pathname;

  const barangayRoutes = ["/dashboard", "/collection-requests", "/redemption"];
  const residentRoutes = [
    "/announcements",
    "/capture",
    "/community",
    "/home",
    "/profile",
    "/requests",
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
    "/capture/:path*",
    "/community/:path*",
    "/home/:path*",
    "/profile/:path*",
    "/requests/:path*",
  ],
};
