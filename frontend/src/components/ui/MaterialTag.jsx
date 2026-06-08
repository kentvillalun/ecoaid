import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const MaterialTag = ({
  type = null,
  points,
  textOnly = false,
  className = "",
  materialName = null,
}) => {
  const styles = {
    Plastics: { bg: "bg-blue-50", dot: "bg-blue-400", text: "text-blue-700" },
    Metals: { bg: "bg-gray-100", dot: "bg-gray-400", text: "text-gray-600" },
    Bottles: {
      bg: "bg-emerald-50",
      dot: "bg-emerald-400",
      text: "text-emerald-700",
    },
    Papers: {
      bg: "bg-yellow-50",
      dot: "bg-yellow-400",
      text: "text-yellow-700",
    },
    Assorted: {
      bg: "bg-orange-50",
      dot: "bg-orange-300",
      text: "text-orange-700",
    },
  };

  return (
    <div
      className={` ${className} ${twMerge("text-xs", className) }  text-no font-medium inline-flex items-center gap-1.5 ${inter.className}  ${styles[type]?.text ?? "text-gray-700"} ${textOnly && 
        styles[type]?.bg ? "" : `${styles[type]?.bg} py-1 px-2 rounded-3xl`
      }`}
    >
      {(!materialName || textOnly) && <div className={`w-1.5 h-1.5 rounded-full ${styles[type]?.dot}`} />} 
      {materialName ? materialName : type}
      {points != null ? ` ${points} ` : ""}
    </div>
  );
};
