import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const LabelValue = ({
  name,
  value,
  className = "",
  valueClassName = "",
}) => {
  return (
    <div className={`${inter.className} flex flex-col ${className}`}>
      <p className="text-[#6b7280] text-xs">{name}</p>
      <p
        className={`text-md ${name === "Notes" && "italic text-text-primary"} ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};
