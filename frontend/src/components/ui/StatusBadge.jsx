import { Inter } from "next/font/google";
import { statusStyles, statusLabels } from "@/lib/statusStyles";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// pending || approved || in_progress || collected || rejected 
export const StatusBadge = ({ type }) => {

  return (
    <div
      className={`py-1 px-2 text-xs rounded-3xl font-medium inline-block ${inter.className} capitalize ${
        statusStyles[type] || "bg-gray-200 text-gray-700"
      }`}
    >
      {statusLabels[type] || type}
    </div>
  );
};
