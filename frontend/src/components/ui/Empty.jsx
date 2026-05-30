import Image from "next/image";

export const Empty = ({ text, subtext, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-full p-15 gap-1 text-center ${className}`}
    >
      {/* <p className="text-sm font-medium uppercase tracking-[0.2em] text-cta-color text-center">
            EcoAid
          </p> */}
      {/* <div className="max-w-20 relative w-full aspect-3/1">
        <Image
          src="/ecoaid-logo/ecoaid-wordmark.svg"
          alt="EcoAid logo"
          fill
          priority
        />
      </div> */}
      <h1 className="text-3xl font-semibold text-[#1F2937] text-center">
        {text}
      </h1>
      <p className="text-sm text-[#6B7280] text-center">{subtext}</p>
    </div>
  );
};
