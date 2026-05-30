import { Card } from "@/components/ui/Card";
import { Inter } from "next/font/google";
import { SearchInput } from "./SearchInput";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const BarangayHeaderCard = ({ title, subtitle }) => {
  return (
    <Card className={`${inter.className} md:py-5! md:px-6! grid! md:grid-cols-2 md:gap-10  new-border shadow-none!`}>
      <div className="flex-col flex">
        <h1 className="font-semibold text-2xl md:text-3xl">{title}</h1>
        <p className="">{subtitle}</p>
      </div>
      <div className=""> 
        <SearchInput className="hidden md:flex!" />
      </div>
    </Card>
  );
};
