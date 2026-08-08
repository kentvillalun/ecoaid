"use client";

import { Sidebar } from "@/components/navigation/Sidebar";
import { useState, createContext, useEffect } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { applyTheme } from "@/lib/themes";
import { useFetch } from "@/hooks/useFetch";

export const DrawerContext = createContext();

export default function BarangayLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: barangayThemeData } = useFetch({
    url: "/api/settings/theme/staff",
  });

  useEffect(() => {
    const cachedTheme = localStorage.getItem("barangayTheme");
    if (cachedTheme) {
      applyTheme(cachedTheme);
    }
  }, []);

  const theme = barangayThemeData?.theme?.themeAccent;
  useEffect(() => {
    if (!theme) return;

    applyTheme(theme);
    localStorage.setItem("barangayTheme", theme);
  }, [theme]);

  return (
    <>
      <DrawerContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        <div className="md:hidden">
          <Toaster position="top-center" />
        </div>
        <div className="hidden md:flex">
          <Toaster position="bottom-right" />
        </div>
        <main className="">{children}</main>
        {sidebarOpen && (
          <AnimatePresence mode="wait">
            <motion.div
              key={"sidebar-backdrop"}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15, ease: "easeIn" },
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <motion.div
                key={"sidebar"}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{
                  x: "-100%",
                  transition: { duration: 0.25, ease: "easeIn" },
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Sidebar />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        <aside className="hidden md:block">
          <Sidebar />
        </aside>
      </DrawerContext.Provider>
    </>
  );
}
