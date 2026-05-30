"use client";

import { Inter } from "next/font/google";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { DrawerContext } from "@/app/(barangay)/layout.jsx";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const BarangayTopBar = ({ title }) => {
 
    const { sidebarOpen, setSidebarOpen} = useContext(DrawerContext)
    
  return (
    <>
      <header
        className={`flex flex-row items-center justify-between min-w-full  max-h-24 bg-new-bg fixed top-0 py-6 px-8 ${inter.className}text-text-primary md:hidden z-40 `}
        style={{ borderBottom: "0.5px solid #e5e7eb" }}
      >
        <Bars3Icon
          className="w-6 h-6 hover:cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <h1 className="font-semibold text-lg text-nowrap">{title}</h1>
        <div className="w-6"></div>
      </header>
    </>
  );
};
