"use client";

import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  CubeIcon,
  ScaleIcon,
  TagIcon,
  FunnelIcon,
  ArrowUpRightIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

const MATERIALS = [
  {
    id: 1,
    name: "Plastic Bottles",
    category: "Plastics",
    quantity: 45.5,
    unit: "kg",
    lastUpdated: "May 30, 2026",
  },
  {
    id: 2,
    name: "Newspaper",
    category: "Papers",
    quantity: 12,
    unit: "kg",
    lastUpdated: "May 29, 2026",
  },
  {
    id: 3,
    name: "Tin Cans",
    category: "Metals",
    quantity: 8.2,
    unit: "kg",
    lastUpdated: "May 28, 2026",
  },
  {
    id: 4,
    name: "Glass Bottles",
    category: "Bottles",
    quantity: 6,
    unit: "kg",
    lastUpdated: "May 27, 2026",
  },
  {
    id: 5,
    name: "Hard Plastics",
    category: "Plastics",
    quantity: 22,
    unit: "kg",
    lastUpdated: "May 30, 2026",
  },
];

const CATEGORY_COLORS = {
  Plastics: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  Papers: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Metals: { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" },
  Bottles: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
};

const CATEGORIES = ["All", "Plastics", "Papers", "Metals", "Bottles"];

const totalWeight = MATERIALS.reduce((sum, m) => sum + m.quantity, 0);
const uniqueCategories = [...new Set(MATERIALS.map((m) => m.category))].length;

export default function MaterialStockPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered =
    selectedCategory === "All"
      ? MATERIALS
      : MATERIALS.filter((m) => m.category === selectedCategory);

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Material Stock" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Material Stock"
          subtitle="Overview of collected recyclable materials"
        />

        {/* Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Total Materials
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {MATERIALS.length}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <CubeIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Material types</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Total Weight</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {totalWeight.toFixed(1)} kg
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ScaleIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Combined weight</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start col-span-2 lg:col-span-1">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Categories</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {uniqueCategories}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <TagIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Active categories</p>
            </div>
          </Card>
        </section>

        {/* Materials Table */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Materials Inventory"
            subtitle="Recyclables from completed intake transactions"
            icon={<ArchiveBoxIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          {/* Category Filter */}
          <div className="flex flex-row gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <FunnelIcon className="w-4" />
              <span className="text-xs font-medium">Filter:</span>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border ${
                  selectedCategory === cat
                    ? "gradient-button text-white border-transparent"
                    : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#d1d5db]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Desktop Table */}
          <Card className="hidden md:flex md:flex-col px-6 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border">
            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-[#E6EFF5]">
                <tr>
                  {["Material", "Category", "Total Quantity", "Unit", "Last Updated"].map((h) => (
                    <th key={h} className="font-medium text-sm text-[#6b7280] p-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const colors = CATEGORY_COLORS[m.category];
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#f8f8f8] transition-all border-b border-[#f3f4f6] last:border-0"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">{m.name}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {m.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-text-primary">{m.quantity}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-[#6b7280]">{m.unit}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-[#6b7280] text-xs">{m.lastUpdated}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((m) => {
              const colors = CATEGORY_COLORS[m.category];
              return (
                <Card
                  key={m.id}
                  className="shadow-none! new-border flex-col! items-start! gap-2"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="font-semibold text-text-primary">{m.name}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {m.category}
                    </span>
                  </div>
                  <div className="flex flex-row gap-6">
                    <div className="flex flex-col">
                      <p className="text-xs text-[#6b7280]">Quantity</p>
                      <p className="font-bold text-text-primary">
                        {m.quantity} {m.unit}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-[#6b7280]">Last Updated</p>
                      <p className="text-sm text-[#6b7280]">{m.lastUpdated}</p>
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
