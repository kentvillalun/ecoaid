"use client";

import { ArrowLeftIcon, BellIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Inter } from "next/font/google";
import { useState } from "react";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ResidentHeader = ({
  title,
  subtitle,
  action,
  setIsEditing,
  className = "",
  handleClick = () => history.back()
}) => {
  
  const [actions, setActions] = useState(action);
  


  const actionItem = () => {
    switch (actions) {
      case "notification":
        return (
         <Link href={"/announcements"} className="bg-white rounded-full p-2" style={{ border: "0.5px solid #e5e7eb"}}>
            <BellIcon className="w-5 h-5" />
          </Link> 
        );
      case 'edit':
        return <PencilSquareIcon className="w-5 h-5 text-[#727272]" onClick={() => setIsEditing((prev) => !prev)}/>

      default: 
       return <div className="w-6"></div> 
    }
  };

  return (
    <header
      className={`flex flex-row items-start justify-between min-w-full bg-white fixed top-0 py-6 px-8 ${inter.className} shadow-lg z-50 min-h-18 ${className}`} style={{ borderBottom: "0.5px solid #e5e7eb" }}
    >
      <div className="flex flex-row items-center justify-between min-w-full">
        <ArrowLeftIcon
          className="h-6"
          onClick={handleClick}
        />
        <div className="flex flex-col items-center text-text-primary">
          <p className="font-semibold text-lg text-nowrap">{title}</p>
          <p className="text-sm text-nowrap">{subtitle}</p>
        </div>
        {actionItem()}
      </div>
    </header>
  );
};
