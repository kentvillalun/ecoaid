"use client";

import { ResidentBottomNav } from "@/components/navigation/ResidentBottomNav";
import { DesktopGuard } from "@/components/ui/DesktopGuard";
import { useFetch } from "@/hooks/useFetch";
import { applyTheme } from "@/lib/themes";
import { usePathname } from "next/navigation";
import { cache, useEffect } from "react";
import { Toaster } from "sonner";

export default function ResidentLayout({ children }) {
  const pathname = usePathname();
  const { data: barangayThemeData } = useFetch({ url: "/api/settings/theme/resident"})

  const paths = [
    "/capture",
    "/updates",
    "/profile/personal-information",
    "/profile/notifications",
    "/profile/settings",
    "/profile/help-support", 
    "/requests/",
  ];
  const hideNav = paths.some((paths) => pathname.startsWith(paths));

  useEffect(() => {
    const cacheTheme = localStorage.getItem("residentTheme")
    if (cacheTheme) {
      applyTheme(cacheTheme)
    }
  }, [])

  const theme = barangayThemeData?.theme?.themeAccent
  useEffect(() => {
    if (!theme) return;

    applyTheme(theme)
    localStorage.setItem("residentTheme", theme) 
  }, [theme])

  return (
    <>
      <Toaster position="top-center" />

      <DesktopGuard />



      <main className="lg:hidden">{children}</main>

      {!hideNav && <ResidentBottomNav classname="lg:hidden"/>}
    </>
  );
}
