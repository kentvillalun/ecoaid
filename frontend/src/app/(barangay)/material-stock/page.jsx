"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { IconContainer } from "@/components/ui/IconContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MaterialTag } from "@/components/ui/MaterialTag";
import {
  ArchiveBoxIcon,
  Bars3BottomLeftIcon,
  ArrowUpTrayIcon,
  ScaleIcon,
  CubeIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: "Plastics",
    materials: [
      { id: 1, name: "PET Bottles",     quantity: 28.5, unit: "kg" },
      { id: 2, name: "HDPE Containers", quantity: 12,   unit: "kg" },
      { id: 3, name: "Plastic Bags",    quantity: 6.5,  unit: "kg" },
    ],
  },
  {
    name: "Papers",
    materials: [
      { id: 4, name: "Newspaper", quantity: 18, unit: "kg" },
      { id: 5, name: "Cardboard", quantity: 22, unit: "kg" },
    ],
  },
  {
    name: "Metals",
    materials: [
      { id: 6, name: "Aluminum Cans", quantity: 9.5, unit: "kg" },
      { id: 7, name: "Tin Cans",      quantity: 6,   unit: "kg" },
      { id: 8, name: "Iron Scraps",   quantity: 14,  unit: "kg" },
    ],
  },
  {
    name: "Bottles",
    materials: [
      { id: 9,  name: "Glass Bottles", quantity: 11, unit: "kg"  },
      { id: 10, name: "Wine Bottles",  quantity: 24, unit: "pcs" },
    ],
  },
];

const TRANSACTION_LOG = [
  {
    id: 1,
    material: "PET Bottles",
    category: "Plastics",
    quantity: 5.5,
    unit: "kg",
    source: "Manual Intake",
    date: "Jun 15, 2026",
  },
  {
    id: 2,
    material: "Newspaper",
    category: "Papers",
    quantity: 8,
    unit: "kg",
    source: "Collection Request",
    date: "Jun 14, 2026",
  },
  {
    id: 3,
    material: "Aluminum Cans",
    category: "Metals",
    quantity: 3,
    unit: "kg",
    source: "Redemption",
    date: "Jun 13, 2026",
  },
  {
    id: 4,
    material: "Glass Bottles",
    category: "Bottles",
    quantity: 4,
    unit: "kg",
    source: "Manual Intake",
    date: "Jun 12, 2026",
  },
  {
    id: 5,
    material: "Cardboard",
    category: "Papers",
    quantity: 10,
    unit: "kg",
    source: "Collection Request",
    date: "Jun 11, 2026",
  },
  {
    id: 6,
    material: "Iron Scraps",
    category: "Metals",
    quantity: 2.5,
    unit: "kg",
    source: "Redemption",
    date: "Jun 10, 2026",
  },
];

// ─── Style Maps ───────────────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  Plastics: {
    headerBg: "bg-blue-50",
    divider:  "border-blue-100",
    dot:      "bg-blue-400",
    text:     "text-blue-700",
  },
  Papers: {
    headerBg: "bg-yellow-50",
    divider:  "border-yellow-100",
    dot:      "bg-yellow-400",
    text:     "text-yellow-700",
  },
  Metals: {
    headerBg: "bg-gray-50",
    divider:  "border-gray-200",
    dot:      "bg-gray-400",
    text:     "text-gray-600",
  },
  Bottles: {
    headerBg: "bg-emerald-50",
    divider:  "border-emerald-100",
    dot:      "bg-emerald-400",
    text:     "text-emerald-700",
  },
};

const TABLE_HEADERS = ["Material", "Quantity", "Unit", "Source", "Date"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const KG_TO_LBS = 2.20462;

// Derived totals from mock data (computed once)
const ALL_MATERIALS  = CATEGORIES.flatMap((c) => c.materials);
const TOTAL_WEIGHT_KG = ALL_MATERIALS
  .filter((m) => m.unit === "kg")
  .reduce((s, m) => s + m.quantity, 0);
const TOTAL_PCS = ALL_MATERIALS
  .filter((m) => m.unit === "pcs")
  .reduce((s, m) => s + m.quantity, 0);

function applyUnit(quantity, unit, displayUnit) {
  if (unit === "pcs") return { qty: quantity, label: "pcs" };
  if (displayUnit === "lbs")
    return { qty: (quantity * KG_TO_LBS).toFixed(1), label: "lbs" };
  return { qty: quantity, label: "kg" };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function UnitToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
        Unit
      </span>
      <div className="flex flex-row bg-white new-border rounded-xl p-0.5 gap-0.5">
        {["kg", "lbs"].map((u) => (
          <button
            key={u}
            onClick={() => onChange(u)}
            className={`
              text-xs px-4 py-1.5 rounded-[9px] font-semibold
              transition-all duration-200 hover:cursor-pointer
              ${value === u
                ? "gradient-button text-white"
                : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {u}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-300 hidden sm:block select-none">
        weight materials only
      </span>
    </div>
  );
}

function CategoryCard({ cat, displayUnit }) {
  const styles = CATEGORY_STYLES[cat.name];

  const totalKg = cat.materials
    .filter((m) => m.unit === "kg")
    .reduce((s, m) => s + m.quantity, 0);
  const totalPcs = cat.materials
    .filter((m) => m.unit === "pcs")
    .reduce((s, m) => s + m.quantity, 0);

  const summaryParts = [];
  if (totalKg > 0) {
    const { qty, label } = applyUnit(totalKg, "kg", displayUnit);
    summaryParts.push(`${qty} ${label}`);
  }
  if (totalPcs > 0) summaryParts.push(`${totalPcs} pcs`);

  return (
    <Card className="shadow-none! new-border flex-col! items-start! gap-0! p-0! overflow-hidden">
      {/* Header band */}
      <div
        className={`
          flex flex-row items-center justify-between w-full
          px-5 py-3.5 ${styles.headerBg} border-b ${styles.divider}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
          <h4 className={`font-semibold text-sm ${styles.text}`}>
            {cat.name}
          </h4>
          <span className="text-xs text-gray-400 font-normal">
            {cat.materials.length}{" "}
            {cat.materials.length !== 1 ? "materials" : "material"}
          </span>
        </div>
        <span className={`text-xs font-semibold ${styles.text}`}>
          {summaryParts.join(" · ")}
        </span>
      </div>

      {/* Material rows */}
      <div className="flex flex-col w-full divide-y divide-gray-50 px-5">
        {cat.materials.map((m) => {
          const { qty, label } = applyUnit(m.quantity, m.unit, displayUnit);
          return (
            <div
              key={m.id}
              className="flex items-center justify-between py-3.5"
            >
              <span className="text-sm text-text-primary font-medium">
                {m.name}
              </span>
              <span className="text-sm font-bold text-text-primary tabular-nums">
                {qty}
                <span className="text-xs font-normal text-gray-400 ml-1">
                  {label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaterialStockPage() {
  const [displayUnit, setDisplayUnit] = useState("kg");

  const totalWeightDisplay =
    displayUnit === "lbs"
      ? `${(TOTAL_WEIGHT_KG * KG_TO_LBS).toFixed(1)} lbs`
      : `${TOTAL_WEIGHT_KG} kg`;

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Material Stock" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">

        {/* Header */}
        <BarangayHeaderCard
          title="Material Stock"
          subtitle="Overview of collected recyclable materials"
        />

        {/* ── Summary stat cards ── */}
        <section className="grid grid-cols-2 gap-3">
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
              {totalWeightDisplay}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ScaleIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">All categories</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Total Pieces</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {TOTAL_PCS} pcs
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <CubeIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Piece-based materials</p>
            </div>
          </Card>
        </section>

        {/* ── Category Overview ── */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Category Overview"
            subtitle="Recyclable materials grouped by category"
            icon={<ArchiveBoxIcon className="w-6 stroke-cta-color" />}
            noButton
          />

          <UnitToggle value={displayUnit} onChange={setDisplayUnit} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.name}
                cat={cat}
                displayUnit={displayUnit}
              />
            ))}
          </div>
        </section>

        {/* ── Transaction Log ── */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Transaction Log"
            subtitle="History of all stock movements"
            icon={<Bars3BottomLeftIcon className="w-6 stroke-cta-color" />}
            buttonLabel="Stock Out"
            buttonIcon={<ArrowUpTrayIcon className="w-5 hidden md:flex" />}
            onAction={() => {}}
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
          >
            <table className="w-full text-sm border-collapse text-gray-600">
              <thead className="border-b border-[#E6EFF5]">
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="font-medium text-start p-4 text-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TRANSACTION_LOG.map((row) => {
                  const { qty, label } = applyUnit(
                    row.quantity,
                    row.unit,
                    displayUnit,
                  );
                  return (
                    <tr
                      key={row.id}
                      className="text-start hover:bg-[#f8f8f8] transition-all duration-150"
                    >
                      <td className="p-4">
                        <MaterialTag
                          type={row.category}
                          materialName={row.material}
                        />
                      </td>
                      <td className="p-4 font-semibold text-text-primary tabular-nums">
                        {qty}
                      </td>
                      <td className="p-4 text-gray-400">{label}</td>
                      <td className="p-4 text-gray-500 text-nowrap">
                        {row.source}
                      </td>
                      <td className="p-4 text-nowrap text-gray-400 text-xs">
                        {row.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {TRANSACTION_LOG.map((row) => {
              const { qty, label } = applyUnit(
                row.quantity,
                row.unit,
                displayUnit,
              );
              return (
                <Card
                  key={row.id}
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <MaterialTag
                      type={row.category}
                      materialName={row.material}
                    />
                    <span className="text-xs text-gray-500">{row.source}</span>
                  </div>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">{row.date}</p>
                    <p className="text-sm font-bold text-text-primary tabular-nums">
                      {qty}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        {label}
                      </span>
                    </p>
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
