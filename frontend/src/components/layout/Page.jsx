"use client";

import { useState } from "react";
import { Inter } from "next/font/google";


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Page = ({ children, className = "", gradient }) => {
  const [isGradient, setIsGradient] = useState(gradient);

  return (
    <>
      <main
        className={` relative min-h-svh flex justify-center ${isGradient ? "bg-linear-to-b from-[#FFFFFF] from-24% to-[#89D957]" : ""} ${inter.className} ${className} `}
      >
        {children}
      </main>
      
    </>
  );
};
