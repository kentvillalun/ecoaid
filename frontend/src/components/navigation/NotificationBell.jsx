"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";

export const NotificationBell = ({ className = "" }) => {
  const { data } = useFetch({ url: "/api/notifications/unread-status" });

  const hasUnread = data?.hasUnread || false;

  return (
    <Link
      href={"/notifications"}
      className={`relative bg-surface rounded-full p-2 ${className}`}
      style={{ border: "0.5px solid var(--color-border)" }}
    >
      <BellIcon className="w-5 h-5" />
      {hasUnread && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
      )}
    </Link>
  );
};
