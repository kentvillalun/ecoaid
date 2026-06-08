"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  BuildingStorefrontIcon,
  ArrowUpRightIcon,
  StarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const JUNKSHOPS = ["Reyes Junkshop", "Dela Cruz Trading", "Vigan Recyclers"];

const PRICE_DATA = [
  { material: "Plastics", prices: [12, 10, 14] },
  { material: "Metals", prices: [25, 28, 22] },
  { material: "Papers", prices: [6, 5, 7] },
  { material: "Bottles", prices: [8, 9, 8] },
];

const MATERIAL_COLORS = {
  Plastics: { bg: "bg-blue-50", text: "text-blue-700" },
  Metals: { bg: "bg-slate-50", text: "text-slate-700" },
  Papers: { bg: "bg-amber-50", text: "text-amber-700" },
  Bottles: { bg: "bg-teal-50", text: "text-teal-700" },
};

const getBestJunkshopIndex = (prices) => {
  const max = Math.max(...prices);
  return prices.indexOf(max);
};

const getBestOverallJunkshop = () => {
  const totals = JUNKSHOPS.map((_, i) =>
    PRICE_DATA.reduce((sum, row) => sum + row.prices[i], 0)
  );
  return JUNKSHOPS[totals.indexOf(Math.max(...totals))];
};

const getTotalBestPrices = () =>
  PRICE_DATA.reduce((sum, row) => sum + Math.max(...row.prices), 0);

export default function JunkshopSalesPage() {
  const bestJunkshop = getBestOverallJunkshop();
  const totalBestValue = getTotalBestPrices();

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Junkshop Sales" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Junkshop Sales"
          subtitle="Compare prices across junkshops to maximize your earnings"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Junkshops Tracked
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {JUNKSHOPS.length}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <BuildingStorefrontIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Active partners</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Best Overall</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-base font-bold text-text-primary text-sm leading-tight mt-1 mb-1">
              {bestJunkshop}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <TrophyIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Top performer</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start col-span-2 lg:col-span-1">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Max Combined Rate
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              ₱{totalBestValue}/kg
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <CurrencyDollarIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">If split optimally</p>
            </div>
          </Card>
        </section>

        {/* Price Comparison Table */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Price Comparison"
            subtitle="Price per kg by junkshop and material type"
            icon={<StarIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          {/* Desktop Table */}
          <Card className="hidden md:flex md:flex-col px-6 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border">
            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-[#E6EFF5]">
                <tr>
                  <th className="font-medium text-sm text-[#6b7280] p-4 text-left w-32">
                    Material
                  </th>
                  {JUNKSHOPS.map((shop) => (
                    <th
                      key={shop}
                      className="font-medium text-sm text-[#6b7280] p-4 text-center"
                    >
                      {shop}
                    </th>
                  ))}
                  <th className="font-medium text-sm text-[#6b7280] p-4 text-center">
                    Best Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRICE_DATA.map((row) => {
                  const bestIdx = getBestJunkshopIndex(row.prices);
                  const bestPrice = Math.max(...row.prices);
                  const colors = MATERIAL_COLORS[row.material];
                  return (
                    <tr
                      key={row.material}
                      className="hover:bg-[#f8f8f8] transition-all border-b border-[#f3f4f6] last:border-0"
                    >
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {row.material}
                        </span>
                      </td>
                      {row.prices.map((price, i) => (
                        <td key={i} className="p-4 text-center">
                          {i === bestIdx ? (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="font-bold text-[#14532D] text-base">
                                ₱{price}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                <CheckCircleIcon className="w-3 h-3 text-green-600" />
                                Best price
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#6b7280] font-medium">
                              ₱{price}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold text-[#14532D] text-base">
                            ₱{bestPrice}
                          </span>
                          <span className="text-xs text-[#6b7280]">
                            {JUNKSHOPS[bestIdx].split(" ")[0]}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {PRICE_DATA.map((row) => {
              const bestIdx = getBestJunkshopIndex(row.prices);
              const colors = MATERIAL_COLORS[row.material];
              return (
                <Card
                  key={row.material}
                  className="shadow-none! new-border flex-col! items-start! gap-3"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {row.material}
                    </span>
                    <span className="text-xs text-[#6b7280]">Price per kg</span>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {JUNKSHOPS.map((shop, i) => (
                      <div
                        key={shop}
                        className={`flex flex-row items-center justify-between px-3 py-2 rounded-lg ${
                          i === bestIdx ? "bg-green-50" : "bg-[#f8f8f8]"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${i === bestIdx ? "text-green-800" : "text-[#6b7280]"}`}
                        >
                          {shop}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${i === bestIdx ? "text-[#14532D]" : "text-text-primary"}`}
                          >
                            ₱{row.prices[i]}
                          </span>
                          {i === bestIdx && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                              Best
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
