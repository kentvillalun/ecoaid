"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  ClipboardDocumentListIcon,
  ScaleIcon,
  UserGroupIcon,
  StarIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";

const MONTHLY_DATA = [
  { month: "Jan", collections: 18 },
  { month: "Feb", collections: 24 },
  { month: "Mar", collections: 31 },
  { month: "Apr", collections: 27 },
  { month: "May", collections: 42 },
  { month: "Jun", collections: 38 },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    date: "May 30, 2026",
    resident: "Maria Santos",
    material: "Plastic Bottles",
    weight: "4.5 kg",
    source: "Drop-off",
  },
  {
    id: 2,
    date: "May 29, 2026",
    resident: "Juan Dela Cruz",
    material: "Newspaper",
    weight: "3.0 kg",
    source: "Collection",
  },
  {
    id: 3,
    date: "May 29, 2026",
    resident: "Ana Reyes",
    material: "Tin Cans",
    weight: "2.1 kg",
    source: "Drop-off",
  },
  {
    id: 4,
    date: "May 28, 2026",
    resident: "Pedro Villanueva",
    material: "Hard Plastics",
    weight: "5.8 kg",
    source: "Collection",
  },
  {
    id: 5,
    date: "May 28, 2026",
    resident: "Rosa Fernandez",
    material: "Glass Bottles",
    weight: "1.5 kg",
    source: "Drop-off",
  },
  {
    id: 6,
    date: "May 27, 2026",
    resident: "Carlo Bautista",
    material: "Plastic Bottles",
    weight: "3.2 kg",
    source: "Collection",
  },
];

const SOURCE_COLORS = {
  "Drop-off": { bg: "bg-blue-50", text: "text-blue-700" },
  Collection: { bg: "bg-green-50", text: "text-green-700" },
};

const maxCollections = Math.max(...MONTHLY_DATA.map((d) => d.collections));

export default function ReportsPage() {
  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Reports" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Reports"
          subtitle="Operational summary of the barangay recycling program"
        />

        {/* Summary Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Total Collections
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              180
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ClipboardDocumentListIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">All time</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Weight Collected</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              1,250 kg
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ScaleIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Total diverted</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Active Residents
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              64
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <UserGroupIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Participating</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Points Awarded</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              8,450
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <StarIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Total issued</p>
            </div>
          </Card>
        </section>

        {/* Monthly Bar Chart */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Collections per Month"
            subtitle="Last 6 months of intake activity"
            icon={<ChartBarIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          <Card className="shadow-none! new-border flex-col! items-start! gap-4 p-6!">
            <div className="w-full flex flex-col gap-1">
              <div className="flex flex-row items-end justify-between gap-2 h-40 w-full">
                {MONTHLY_DATA.map((d) => {
                  const heightPct = (d.collections / maxCollections) * 100;
                  const iMax = d.collections === maxCollections;
                  return (
                    <div
                      key={d.month}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <span
                        className={`text-[10px] font-semibold ${iMax ? "text-cta-color" : "text-[#6b7280]"}`}
                      >
                        {d.collections}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all ${iMax ? "gradient-button" : "bg-[#e5e7eb]"}`}
                        style={{ height: `${heightPct}%`, minHeight: "8px" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-row justify-between gap-2">
                {MONTHLY_DATA.map((d) => (
                  <span
                    key={d.month}
                    className="text-[11px] font-medium text-[#6b7280] text-center flex-1"
                  >
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 pt-2 border-t border-[#f3f4f6] w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm gradient-button inline-block" />
                <span className="text-xs text-[#6b7280]">Peak month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#e5e7eb] inline-block" />
                <span className="text-xs text-[#6b7280]">Regular month</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Recent Activity */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Recent Activity"
            subtitle="Latest recorded intake transactions"
            icon={<Bars3BottomLeftIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          {/* Desktop Table */}
          <Card className="hidden md:flex md:flex-col px-6 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border">
            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-[#E6EFF5]">
                <tr>
                  {["Date", "Resident", "Material", "Weight", "Source"].map((h) => (
                    <th
                      key={h}
                      className="font-medium text-sm text-[#6b7280] p-4 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ACTIVITY.map((item) => {
                  const colors = SOURCE_COLORS[item.source];
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f8f8f8] transition-all border-b border-[#f3f4f6] last:border-0"
                    >
                      <td className="p-4">
                        <p className="text-[#6b7280] text-xs">{item.date}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">
                          {item.resident}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-text-primary">{item.material}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-text-primary">{item.weight}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {item.source}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {RECENT_ACTIVITY.map((item) => {
              const colors = SOURCE_COLORS[item.source];
              return (
                <Card
                  key={item.id}
                  className="shadow-none! new-border flex-col! items-start! gap-2"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="font-semibold text-text-primary">
                      {item.resident}
                    </p>
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {item.source}
                    </span>
                  </div>
                  <div className="flex flex-row gap-6">
                    <div className="flex flex-col">
                      <p className="text-xs text-[#6b7280]">Material</p>
                      <p className="text-sm font-medium text-text-primary">
                        {item.material}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-[#6b7280]">Weight</p>
                      <p className="text-sm font-bold text-text-primary">
                        {item.weight}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-[#6b7280]">Date</p>
                      <p className="text-xs text-[#6b7280]">{item.date}</p>
                    </div>
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
