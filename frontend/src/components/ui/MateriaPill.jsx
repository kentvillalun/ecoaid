import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const MaterialPill = ({ type, points, className = "" }) => {




  const styles = {
    Plastics: "bg-green-100 text-green-700",
    Metals: "bg-gray-100 text-gray-600",
    Bottles: "bg-emerald-100 text-emerald-700",
    Papers: "bg-lime-100 text-lime-700",
    Assorted: "bg-orange-100 text-orange-700"
  };

  const labels = {
    Plastics : "Plastics",
    Metals: "Metals",
    Bottles: "Bottles",
    Papers: "Papers",
    Assorted: "Assorted",
  };

  return (
    <div
      className={`py-1 px-4 ${className} text-xs rounded-3xl font-medium w-30 text-center ${inter.className} ${
        styles[type] || "bg-gray-200 text-gray-700"
      }`}
    >
      {labels[type] || type} {points != null ? `${points} pts` : ""}
    </div>
  );
};
