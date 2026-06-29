"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Modal } from "@/components/ui/Modal";
import {
  BuildingStorefrontIcon,
  ArrowUpRightIcon,
  TrophyIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// ─── Mock Data ────────────────────────────────────────────────────────────────

const JUNKSHOPS = [
  { id: "js1", name: "Reyes Junkshop" },
  { id: "js2", name: "Dela Cruz Trading" },
  { id: "js3", name: "Vigan Recyclers" },
];

const PRICE_DATA = [
  { material: "PET Bottles",   category: "Plastics", prices: [12, 10, 14] },
  { material: "Iron Scraps",   category: "Metals",   prices: [25, 28, 22] },
  { material: "Newspaper",     category: "Papers",   prices: [6,  5,  7]  },
  { material: "Glass Bottles", category: "Bottles",  prices: [8,  9,  8]  },
];

const MOCK_MATERIALS = [
  { id: "m1", name: "PET Bottles" },
  { id: "m2", name: "Iron Scraps" },
  { id: "m3", name: "Newspaper" },
  { id: "m4", name: "Glass Bottles" },
  { id: "m5", name: "Cardboard" },
  { id: "m6", name: "Aluminum Cans" },
];

const SALES_HISTORY = [
  {
    id: 1,
    junkshop: "Reyes Junkshop",
    materials: [
      { name: "PET Bottles",     category: "Plastics", quantity: 50,  unit: "kg",  pricePerUnit: 12, subtotal: 600  },
      { name: "HDPE Containers", category: "Plastics", quantity: 30,  unit: "kg",  pricePerUnit: 11, subtotal: 330  },
      { name: "Aluminum Cans",   category: "Metals",   quantity: 160, unit: "pcs", pricePerUnit: 2,  subtotal: 320  },
    ],
    totalAmount: 1250,
    performedBy: "Juan dela Cruz",
    date: "Jun 28, 2026",
  },
  {
    id: 2,
    junkshop: "Dela Cruz Trading",
    materials: [
      { name: "Newspaper", category: "Papers", quantity: 50, unit: "kg", pricePerUnit: 5, subtotal: 250 },
      { name: "Cardboard", category: "Papers", quantity: 36, unit: "kg", pricePerUnit: 5, subtotal: 180 },
    ],
    totalAmount: 430,
    performedBy: "Maria Santos",
    date: "Jun 25, 2026",
  },
  {
    id: 3,
    junkshop: "Vigan Recyclers",
    materials: [
      { name: "Glass Bottles", category: "Bottles", quantity: 40, unit: "kg", pricePerUnit: 8, subtotal: 320 },
    ],
    totalAmount: 320,
    performedBy: "Juan dela Cruz",
    date: "Jun 22, 2026",
  },
  {
    id: 4,
    junkshop: "Reyes Junkshop",
    materials: [
      { name: "Iron Scraps",   category: "Metals", quantity: 30,  unit: "kg",  pricePerUnit: 25, subtotal: 750  },
      { name: "Copper Wire",   category: "Metals", quantity: 15,  unit: "kg",  pricePerUnit: 70, subtotal: 1050 },
      { name: "Aluminum Cans", category: "Metals", quantity: 150, unit: "pcs", pricePerUnit: 2,  subtotal: 300  },
    ],
    totalAmount: 2100,
    performedBy: "Pedro Reyes",
    date: "Jun 18, 2026",
  },
  {
    id: 5,
    junkshop: "Dela Cruz Trading",
    materials: [
      { name: "PET Bottles", category: "Plastics", quantity: 25, unit: "kg", pricePerUnit: 10, subtotal: 250 },
      { name: "Newspaper",   category: "Papers",   quantity: 86, unit: "kg", pricePerUnit: 5,  subtotal: 430 },
    ],
    totalAmount: 680,
    performedBy: "Maria Santos",
    date: "Jun 15, 2026",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBestPriceIndex = (prices) => prices.indexOf(Math.max(...prices));

const getBestOverallJunkshop = () => {
  const totals = JUNKSHOPS.map((_, i) =>
    PRICE_DATA.reduce((sum, row) => sum + row.prices[i], 0)
  );
  return JUNKSHOPS[totals.indexOf(Math.max(...totals))].name;
};

const formatCurrency = (amount) =>
  `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── BreakdownTable ───────────────────────────────────────────────────────────

function BreakdownTable({ materials }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left pb-2 pr-4 font-medium text-gray-400 text-nowrap">Material</th>
          <th className="text-right pb-2 px-3 font-medium text-gray-400 text-nowrap">Qty / Weight</th>
          <th className="text-right pb-2 px-3 font-medium text-gray-400 text-nowrap">Price</th>
          <th className="text-right pb-2 pl-3 font-medium text-gray-400 text-nowrap">Subtotal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {materials.map((m, i) => (
          <tr key={i}>
            <td className="py-2 pr-4">
              <MaterialTag type={m.category} materialName={m.name} />
            </td>
            <td className="text-right py-2 px-3 text-gray-600 tabular-nums text-nowrap">
              {m.quantity} {m.unit}
            </td>
            <td className="text-right py-2 px-3 text-gray-400 tabular-nums text-nowrap">
              ₱{m.pricePerUnit}/{m.unit}
            </td>
            <td className="text-right py-2 pl-3 font-semibold text-text-primary tabular-nums text-nowrap">
              {formatCurrency(m.subtotal)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── MaterialsCell ────────────────────────────────────────────────────────────

function MaterialsCell({ materials }) {
  const visible = materials.slice(0, 2);
  const hidden  = materials.slice(2);

  return (
    <div className="relative group cursor-default">
      {/* Trigger: first 2 tags + overflow count */}
      <div className="flex flex-row flex-wrap items-center gap-1">
        {visible.map((m, i) => (
          <MaterialTag key={i} type={m.category} materialName={m.name} />
        ))}
        {hidden.length > 0 && (
          <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full bg-gray-100 select-none">
            +{hidden.length} more
          </span>
        )}
      </div>
      {/* Hover tooltip — breakdown table for all materials */}
      <div className="absolute left-0 top-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
        <div className="mt-1 bg-white border border-gray-200 rounded-xl px-3 pt-3 pb-3 min-w-max">
          <BreakdownTable materials={materials} />
        </div>
      </div>
    </div>
  );
}

// ─── RecordSaleModal ──────────────────────────────────────────────────────────

function RecordSaleModal({ isOpen, onClose, preselectedJunkshopId = undefined }) {
  const [items, setItems] = useState([{ materialId: "", quantity: "", unit: "kg" }]);

  const addItem    = () => setItems((prev) => [...prev, { materialId: "", quantity: "", unit: "kg" }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<ShoppingBagIcon className="w-6 stroke-new-primary" />}
      title="Record Sale"
      subtitle="Log a junkshop sale transaction"
      confirmLabel="Record Sale"
      confirmClassName="gradient-button"
      onConfirm={() => {}}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Junkshop select */}
        <div className="flex flex-col gap-1">
          <label className="label">Junkshop</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
            <select
              className="w-full outline-none"
              defaultValue={preselectedJunkshopId ?? ""}
            >
              <option value="" disabled hidden>Select junkshop</option>
              {JUNKSHOPS.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic item rows */}
        <div className="flex flex-col gap-1">
          <label className="label">Materials sold</label>
          <div className="flex flex-col gap-3">
            {items.map((_, index) => (
              <div key={index} className="new-border bg-white rounded-xl p-4">
                <div className="flex flex-row items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Material {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="w-5 stroke-gray-400" />
                  </button>
                </div>

                {/* Material select */}
                <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2 flex items-center">
                  <select className="w-full outline-none" defaultValue="">
                    <option value="" disabled hidden>Select material</option>
                    {MOCK_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity + Unit */}
                <div className="flex flex-row gap-2">
                  <div className="flex-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
                    <input
                      type="number"
                      className="w-full outline-none flex-1"
                      min={0}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="w-24 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
                    <select className="w-full outline-none" defaultValue="kg">
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-2 min-w-full"
          >
            <p className="text-gray-700">Add material</p>
          </button>
        </div>
      </div>
    </Modal>,
    document.body
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const HISTORY_HEADERS = ["Junkshop", "Materials", "Total Amount", "Performed By", "Date"];

export default function JunkshopSalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bestJunkshop = getBestOverallJunkshop();

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Junkshop Sales" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">

        {/* Header */}
        <BarangayHeaderCard
          title="Junkshop Sales"
          subtitle="Compare prices across junkshops to maximize your earnings"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">Junkshops Tracked</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">{JUNKSHOPS.length}</p>
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
              <p className="text-xs font-medium text-[#6b7280]">Stat TBD</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-gray-300 text-lg select-none">—</p>
            <div className="flex flex-row items-center w-auto bg-gray-50 px-3 py-1 rounded-xl text-xs gap-1">
              <QuestionMarkCircleIcon className="w-3 stroke-gray-400" />
              <p className="text-gray-400 font-medium">Placeholder</p>
            </div>
          </Card>
        </section>

        {/* Price Comparison */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Price Comparison"
            subtitle="Price per kg by junkshop and material type"
            icon={<StarIcon className="w-6 stroke-cta-color" />}
            buttonLabel="Record Sale"
            buttonIcon={<ShoppingBagIcon className="w-5 hidden md:flex" />}
            onAction={() => setIsModalOpen(true)}
          />

          {/* Desktop table */}
          <Card className={`${inter.className} hidden md:flex md:flex-col px-6 md:gap-3 md:items-start shadow-none! new-border`}>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-[#E6EFF5]">
                  <tr>
                    <th className="font-medium text-start p-4 text-nowrap">Material</th>
                    {JUNKSHOPS.map((shop) => (
                      <th key={shop.id} className="font-medium text-center p-4 text-nowrap">
                        {shop.name}
                      </th>
                    ))}
                    <th className="font-medium text-center p-4 text-nowrap text-cta-color">
                      Best Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PRICE_DATA.map((row) => {
                    const bestIdx  = getBestPriceIndex(row.prices);
                    const bestPrice = Math.max(...row.prices);
                    return (
                      <tr key={row.material} className="hover:bg-[#f8f8f8] transition-all duration-150">
                        <td className="p-4">
                          <MaterialTag type={row.category} materialName={row.material} />
                        </td>
                        {row.prices.map((price, i) => (
                          <td key={i} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {}}
                              className={`inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 hover:cursor-pointer w-full
                                ${i === bestIdx ? "hover:bg-green-100" : "hover:bg-gray-100"}`}
                            >
                              <span className={`font-semibold tabular-nums ${i === bestIdx ? "text-cta-color text-base" : "text-text-primary"}`}>
                                ₱{price}
                              </span>
                              {i === bestIdx && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                  <CheckCircleIcon className="w-3 h-3 text-green-600" />
                                  Best price
                                </span>
                              )}
                            </button>
                          </td>
                        ))}
                        <td className="p-4 text-center bg-green-50/40">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-bold text-cta-color text-base tabular-nums">₱{bestPrice}</span>
                            <span className="text-xs text-[#6b7280]">
                              {JUNKSHOPS[bestIdx].name.split(" ")[0]}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile price cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {PRICE_DATA.map((row) => {
              const bestIdx = getBestPriceIndex(row.prices);
              return (
                <Card key={row.material} className="shadow-none! new-border flex-col! items-start! gap-3">
                  <div className="flex flex-row items-center justify-between w-full">
                    <MaterialTag type={row.category} materialName={row.material} />
                    <span className="text-xs text-[#6b7280]">₱ per kg</span>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {JUNKSHOPS.map((shop, i) => (
                      <button
                        key={shop.id}
                        type="button"
                        onClick={() => {}}
                        className={`flex flex-row items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 hover:cursor-pointer w-full text-left
                          ${i === bestIdx ? "bg-green-50" : "bg-[#f8f8f8] hover:bg-gray-100"}`}
                      >
                        <p className={`text-sm font-medium ${i === bestIdx ? "text-green-800" : "text-[#6b7280]"}`}>
                          {shop.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold tabular-nums ${i === bestIdx ? "text-cta-color" : "text-text-primary"}`}>
                            ₱{row.prices[i]}
                          </span>
                          {i === bestIdx && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                              Best
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Sales History */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Sales History"
            subtitle="Recent transactions across junkshops"
            icon={<ClipboardDocumentListIcon className="w-6 stroke-cta-color" />}
            noButton
          />

          {/* Desktop table */}
          <Card className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}>
            <div className="w-full">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-[#E6EFF5]">
                  <tr>
                    {HISTORY_HEADERS.map((h) => (
                      <th key={h} className="font-medium text-start p-4 text-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SALES_HISTORY.map((row) => (
                    <tr key={row.id} className="text-start hover:bg-[#f8f8f8] transition-all duration-150">
                      <td className="p-4 font-medium text-text-primary text-nowrap">{row.junkshop}</td>
                      <td className="p-4"><MaterialsCell materials={row.materials} /></td>
                      <td className="p-4 font-bold text-text-primary tabular-nums text-nowrap">
                        {formatCurrency(row.totalAmount)}
                      </td>
                      <td className="p-4 text-gray-500 text-nowrap">{row.performedBy}</td>
                      <td className="p-4 text-nowrap text-gray-400 text-xs">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {SALES_HISTORY.map((row) => (
              <Card key={row.id} className="flex flex-col items-start gap-3 shadow-none! new-border">
                <div className="flex flex-row items-center justify-between w-full">
                  <p className="text-sm font-semibold text-text-primary">{row.junkshop}</p>
                  <p className="text-sm font-bold text-cta-color tabular-nums">
                    {formatCurrency(row.totalAmount)}
                  </p>
                </div>
                <div className="w-full overflow-x-auto">
                  <BreakdownTable materials={row.materials} />
                </div>
                <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{row.date}</p>
                  <p className="text-xs text-gray-500">{row.performedBy}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Modal */}
        <RecordSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

      </PageContent>
    </Page>
  );
}
