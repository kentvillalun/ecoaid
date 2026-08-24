import Image from "next/image";

export const Logo = () => {
  return (
    <div className="max-w-10 relative w-full aspect-square">
      <Image
        src="/ecoaid-logo/logo-gradient-dark.svg"
        alt="EcoAid logo"
        fill
        priority
      />
    </div>
  );
};
