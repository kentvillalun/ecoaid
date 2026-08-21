import Image from "next/image";

export const LogoCircle = () => {
  return (
    <div className="-top-6 left-6 absolute rounded-full gradient-card w-16 h-16 flex items-center justify-center">
      <div className="w-8.5 relative aspect-square ">
        <Image
          src="/ecoaid-logo/ecoaid-green-logo.png"
          alt="EcoAid logo"
          fill
          priority
        />
      </div>
    </div>
  );
};
