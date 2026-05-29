import Image from "next/image";

export const DesktopGuard = () => {
  return (
    <main className="hidden lg:flex h-svh w-full items-center justify-center bg-new-primary">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="max-w-40 relative w-full aspect-3/1">
          <Image
            src="/ecoaid-logo/white-logo-wordmark.svg"
            alt="EcoAid logo"
            fill
            priority
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">
            Designed for Mobile
          </p>
          <p className="text-sm text-white mt-1 max-w-xs">
            EcoAid's resident experience is optimized for mobile and tablet
            devices. For the best experience, please open this page on your
            phone or tablet.
          </p>
        </div>
        {/* QR code placeholder — optional for later */}
      </div>
    </main>
  );
};
