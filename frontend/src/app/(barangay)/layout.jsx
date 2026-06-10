"use client";

import { Sidebar } from "@/components/navigation/Sidebar";
import { useState, createContext } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const DrawerContext = createContext();

export default function BarangayLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <DrawerContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        <Toaster position="top-center" />
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
