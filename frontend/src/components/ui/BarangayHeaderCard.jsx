import { Card } from "@/components/ui/Card";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// SearchInput is temporarily removed here (site-wide, since every barangay
// page shares this header) until search is actually wired up to something.
export const BarangayHeaderCard = ({ title, subtitle }) => {
  return (
    <Card className={`${inter.className} md:py-5! md:px-6! grid! new-border shadow-none!`}>
      <div className="flex-col flex">
        <h1 className="font-semibold text-2xl md:text-3xl">{title}</h1>
        <p className="">{subtitle}</p>
      </div>
    </Card>
  );
};
