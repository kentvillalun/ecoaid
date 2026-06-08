
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Badge = ({label, color, className = ""}) => {

    return (
        <div
      className={`py-1 px-2 inline-block text-xs rounded-3xl font-medium text-center  ${inter.className} ${color} ${className}`}
    >
      {label}
    </div>
    )
}