import Image from "next/image";

export const Empty = ({ text, subtext, className = "", textClassName = "", subtextClassName = '' }) => {
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
      {/* mobile: compact text; md and up: original larger heading */}
      <h1 className={`text-sm font-medium text-dark md:text-xl md:font-semibold md:text-text-primary text-center ${textClassName}`} >
        {text}
      </h1>
      <p className={`text-xs text-black md:text-sm md:text-text-secondary text-center ${subtextClassName}`}>{subtext}</p>
    </div>
  );
};
