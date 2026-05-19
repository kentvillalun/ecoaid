import { Page } from "../layout/Page";
import Image from "next/image";

export const DesktopGuard = () => {
  return (
    <main
      className="hidden lg:flex h-svh w-full items-center justify-center bg-linear-to-b from-[#FFFFFF] from-24% to-[#89D957]"
      
    >
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#74C857]">
          EcoAid
        </p>
        <div>
          <p className="text-lg font-semibold text-[#1a1a1a]">
            Designed for Mobile
          </p>
          <p className="text-sm text-[#1a1a1a] mt-1 max-w-xs">
            EcoAid's resident experience is optimized for mobile and tablet devices. For the best experience, please open this page on your phone or tablet.
          </p>
        </div>
        {/* QR code placeholder — optional for later */}
      </div>
    </main>
  );
};
