import { Inter } from "next/font/google";
import {
  HomeIcon,
  MapPinIcon,
  ClipboardIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  CameraIcon,
  HomeIcon as HomeIconSolid,
  MapPinIcon as MapPinIconSolid,
  ClipboardIcon as ClipboardIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ResidentBottomNav = ({classname = ""}) => {
  const pathname = usePathname();

  const isHome = pathname.startsWith("/home");
  const isCommunity = pathname.startsWith("/community");
  const isRequests = pathname.startsWith("/requests");
  const isProfile = pathname.startsWith("/profile");

  return (
    <section
      className={`min-h-18.75 bottom-0 bg-white min-w-screen pb-2.25 flex flex-row items-center justify-center px-3 z-1000 fixed ${inter.className} ${classname}`}
    >
      <div className="grid grid-cols-3 gap-1 text-[#9DB2CE]">
        <div className="grid grid-cols-2 gap-3">
          <Link
            className="flex flex-col items-center justify-center"
            href="/home"
          >
            {isHome ? (
              <>
                <HomeIconSolid className="h-6.25 w-6.25 fill-[#89d957]" />
                <p className="text-[12px] text-[#89d957]">Home</p>
              </>
            ) : (
              <>
                <HomeIcon className="h-6.25 w-6.25" />
                <p className="text-[12px]">Home</p>
              </>
            )}
          </Link>
          <Link
            className="flex flex-col items-center justify-center"
            href="/community"
          >
            {isCommunity ? (
              <>
                <MapPinIconSolid className="h-6.25 w-6.25 fill-[#89d957]" />
                <p className="text-[12px] text-[#89d957]">Barangay</p>
              </>
            ) : (
              <>
                <MapPinIcon className="h-6.25 w-6.25" />
                <p className="text-[12px]">Barangay</p>
              </>
            )}
          </Link>
        </div>

        <div className="">
          <Link
            className="min-w-16 min-h-16 bg-[#89D957] flex items-center justify-center rounded-full border-2 border-white shadow-gray-400 shadow-lg trasform -translate-y-10"
            href="/capture"
          >
            <CameraIcon className="fill-white h-7.75  w-7.75 " />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            className="flex flex-col items-center justify-center"
            href="/requests"
          >
            {isRequests ? (
              <>
                <ClipboardIconSolid className="h-6.25 w-6.25 fill-[#89d957]" />
                <p className="text-[12px] text-[#89d957]">Requests</p>
              </>
            ) : (
              <>
                <ClipboardIcon className="h-6.25 w-6.25" />
                <p className="text-[12px]">Requests</p>
              </>
            )}
          </Link>
          <Link
            className="flex flex-col items-center justify-center"
            href="/profile"
          >
            {isProfile ? (
              <>
                <UserIconSolid className="h-6.25 w-6.25 fill-[#89d957]" />
                <p className="text-[12px] text-[#89d957]">Profile</p>
              </>
            ) : (
              <>
                <UserIcon className="h-6.25 w-6.25" />
                <p className="text-[12px]">Profile</p>
              </>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
};
