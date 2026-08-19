"use client";

import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Inter } from "next/font/google";
import { useState } from "react";
import { NotificationBell } from "@/components/navigation/NotificationBell";

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
        return <NotificationBell />;
      case 'edit':
        return <PencilSquareIcon className="w-5 h-5 text-[#727272]" onClick={() => setIsEditing((prev) => !prev)}/>

      default: 
       return <div className="w-6"></div> 
    }
  };

  return (
    <header
      className={`flex flex-row items-start justify-between min-w-full bg-bg fixed top-0 py-6 px-8 ${inter.className} z-50 min-h-18 ${className}`} style={{ borderBottom: "0.5px solid var(--color-border)" }}
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
