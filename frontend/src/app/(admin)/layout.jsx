"use client";

import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { useState, createContext } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const AdminDrawerContext = createContext();

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AdminDrawerContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
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
              key={"admin-sidebar-backdrop"}
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
                key={"admin-sidebar"}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{
                  x: "-100%",
                  transition: { duration: 0.25, ease: "easeIn" },
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <AdminSidebar />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        <aside className="hidden md:block">
          <AdminSidebar />
        </aside>
      </AdminDrawerContext.Provider>
    </>
  );
}
