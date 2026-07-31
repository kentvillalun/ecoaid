"use client";

import { ArrowLeftIcon, BellIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
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
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  // Check localStorage on mount to see if there are unread announcements
  useEffect(() => {
    const lastViewed = localStorage.getItem("lastViewedAnnouncements");
    const latestAnnouncementDate = localStorage.getItem("latestAnnouncementDate");

    // First time visiting - never checked announcements before
    if (!lastViewed) {
      setHasNewAnnouncements(true);
      return;
    }

    // A new announcement was posted after the last time the user viewed the page
    if (latestAnnouncementDate && new Date(latestAnnouncementDate) > new Date(lastViewed)) {
      setHasNewAnnouncements(true);
    }
  }, []);

  const actionItem = () => {
    switch (actions) {
      case "notification":
        return (
         <Link href={"/updates"} className="relative bg-surface rounded-full p-2" style={{ border: "0.5px solid var(--color-border)"}}>
            <BellIcon className="w-5 h-5" />
            {hasNewAnnouncements && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            )}
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
