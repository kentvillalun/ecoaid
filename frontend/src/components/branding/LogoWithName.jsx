import Image from "next/image";

export const LogoWithName = ({ nameSize = "text-xl", logoSize = "max-w-10", className = '' }) => {
  return (
    <div className={`${className} flex flex-row w-full items-center gap-2`}>
      <div className={`${logoSize} relative w-full aspect-square`}>
        <Image
          src="/ecoaid-logo/logo-gradient-dark.svg"
          alt="EcoAid logo"
          fill
          priority
        />
      </div>
      <p className={`font-baloo ${nameSize} text-dark font-medium leading-none`}>
        ecoaid
      </p>
    </div>
  );
};
