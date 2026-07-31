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
    <div className={`${inter.className} flex flex-col w-full  ${className}`}>
      <p className="text-text-secondary text-xs">{name}</p>
      <div
        className={`text-sm ${(name === "Notes" || name === "Description") && "italic text-text-primary "} ${valueClassName}`}
      >
        {value}
      </div>
    </div>
  );
};
