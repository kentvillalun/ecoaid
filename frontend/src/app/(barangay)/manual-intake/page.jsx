"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/formatDate";
import {
  Bars3BottomLeftIcon,
  InboxArrowDownIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Inter } from "next/font/google";
import { useState } from "react";
import { createPortal } from "react-dom";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const MOCK_INTAKES = [
  {
    id: 1,
    residentName: "Maria Santos",
    isRegistered: true,
    sitio: "Bulala",
    materials: [
      { name: "Plastic Bottles", type: "Plastics", quantity: 3, unit: "kg" },
      { name: "Cardboard", type: "Papers", quantity: 5, unit: "kg" },
      { name: "Aluminum Cans", type: "Metals", quantity: 1.5, unit: "kg" },
    ],
    intakeDate: "2026-06-08T09:30:00",
  },
  {
    id: 2,
    residentName: "Jose Reyes",
    isRegistered: true,
    sitio: "Centro",
    materials: [
      { name: "Glass Bottles", type: "Bottles", quantity: 2, unit: "kg" },
      { name: "Metal Scraps", type: "Metals", quantity: 4, unit: "kg" },
    ],
    intakeDate: "2026-06-07T14:15:00",
  },
  {
    id: 3,
    residentName: "Dela Cruz Household",
    isRegistered: false,
    sitio: null,
    materials: [
      { name: "Newspaper", type: "Papers", quantity: 7, unit: "kg" },
      { name: "Plastic Bags", type: "Plastics", quantity: 1, unit: "kg" },
      { name: "Tin Cans", type: "Metals", quantity: 2, unit: "kg" },
      { name: "Cardboard", type: "Papers", quantity: 3, unit: "kg" },
    ],
    intakeDate: "2026-06-07T10:00:00",
  },
  {
    id: 4,
    residentName: "Ana Villanueva",
    isRegistered: true,
    sitio: "Ilocos",
    materials: [
      { name: "PET Bottles", type: "Plastics", quantity: 2.5, unit: "kg" },
      { name: "Mixed Paper", type: "Papers", quantity: 4, unit: "kg" },
      { name: "Scrap Metal", type: "Metals", quantity: 1, unit: "kg" },
    ],
    intakeDate: "2026-06-06T08:45:00",
  },
  {
    id: 5,
    residentName: "Bautista Household",
    isRegistered: false,
    sitio: null,
    materials: [
      {
        name: "Plastic Containers",
        type: "Plastics",
        quantity: 1.5,
        unit: "kg",
      },
      { name: "White Paper", type: "Papers", quantity: 2, unit: "kg" },
    ],
    intakeDate: "2026-06-05T16:20:00",
  },
];

const TABLE_HEADERS = ["Resident Name", "Sitio", "Materials", "Intake Date"];

function MaterialsCell({ materials }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex flex-wrap gap-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {materials.map((m, i) => (
        <MaterialTag key={i} type={m.type} materialName={m.name} />
      ))}
      {show && (
        <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-xl shadow-lg new-border p-3 min-w-56">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Materials & Quantity
          </p>
          <div className="flex flex-col gap-1">
            {materials.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-6">
                <MaterialTag type={m.type} materialName={m.name} />
                <span className="text-xs text-gray-500 text-nowrap">
                  {m.quantity} {m.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResidentNameCell({ name, isRegistered }) {
  return (
    <div className="flex flex-row items-center gap-2 flex-wrap">
      <p className="font-semibold text-text-primary text-nowrap">{name}</p>
      {!isRegistered && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-nowrap">
          Unregistered
        </span>
      )}
    </div>
  );
}

export default function ManualIntakePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHousehold, setShowHousehold] = useState(false);

  const [materialRows, setMaterialRows] = useState([
    { materialId: "", amount: "", unit: "" },
  ]);

  const removeRow = (index) => {
    const removed = materialRows.filter((_, i )=> i !== index)
    setMaterialRows(removed);
  }

  const updateRow = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;
    setMaterialRows(updated)
  }
  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Manual Collection Intake" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Manual Collection Intake"
          subtitle="Record recyclable material contributions from all sources"
        />

        {isModalOpen &&
          createPortal(
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              icon={<InboxArrowDownIcon className="w-6 stroke-new-primary" />}
              title={"Record Intake"}
              subtitle={
                "Record collected materials for a resident or household."
              }
              confirmLabel={"Record Intake"}
              confirmClassName={"gradient-button"}
            >
              <div className="flex flex-col gap-3 p-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="searchResident" className="label">
                    Resident
                  </label>
                  <input
                    type="text"
                    className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11  max-h-11"
                    id="searchResident"
                    placeholder="Search and select resident name"

                  />
                </div>

                {showHousehold && (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="household" className="label">
                      Household name
                    </label>
                    <input
                      type="text"
                      className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11  max-h-11"
                      id="household"
                      placeholder="Input resident name"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label htmlFor="" className="label">
                    Materials
                  </label>

                  <div className="flex flex-col gap-3">
                    {materialRows.map((material, index) => (
                      <div
                        key={index}
                        className="new-border bg-white rounded-xl p-4"
                      >
                        <div className="flex flex-row items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Material 
                          </span>
                          <button
                            type="button"
                            className="hover:cursor-pointer"
                            onClick={() => {
                              removeRow(index)
                            }}
                          >
                            <XMarkIcon className="w-5 stroke-gray-400" />
                          </button>
                        </div>

                        <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2">
                          <select className="w-full outline-none" onChange={(e) => updateRow(index, "materialId", e.target.value) }>
                            <option value="" disabled hidden>
                              Select material
                            </option>
                          </select>
                        </div>

                        <div className="flex flex-row gap-2">
                          <div className="flex-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11">
                            <input
                              type="text"
                              className="outline-none w-full"
                              placeholder="Amount, e.g. 20"
                              onChange={(e) => {
                                updateRow(index, "amount", e.target.value)
                              } }
                            />
                          </div>
                          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 min-w-28">
                            <select className="w-full outline-none" onChange={(e) => {
                              updateRow(index, 'unit', e.target.value)
                            }}>
                              <option value="" disabled hidden>
                                Unit
                              </option>
                              <option>kg</option>
                              <option>lbs</option>
                              <option>gram</option>
                              <option>piece</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="flex flex-row items-center justify-center text-base py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer gap-2 mt-3"
                  type="button"
                  onClick={() => {
                    setMaterialRows([
                      ...materialRows,
                      { materialId: "", amount: "", unit: "" },
                    ]);
                  }}
                >
                  <PlusIcon className="text-gray-600 w-4" />
                  <p className="text-gray-600">Add material</p>
                </button>
              </div>
            </Modal>,
            document.body,
          )}

        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Intake History"
            subtitle="All recorded manual intake entries"
            icon={<Bars3BottomLeftIcon className="w-6 stroke-cta-color" />}
            buttonLabel="Record Intake"
            onAction={() => {
              setIsModalOpen(true);
            }}
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
                {MOCK_INTAKES.map((row) => (
                  <tr
                    key={row.id}
                    className="text-start hover:bg-[#f8f8f8] transition-all transform"
                  >
                    <td className="p-4">
                      <ResidentNameCell
                        name={row.residentName}
                        isRegistered={row.isRegistered}
                      />
                    </td>
                    <td className="p-4 text-nowrap">{row.sitio ?? "—"}</td>
                    <td className="p-4">
                      <MaterialsCell materials={row.materials} />
                    </td>
                    <td className="p-4 text-nowrap">
                      {formatDate(row.intakeDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {MOCK_INTAKES.map((row) => (
              <Card
                key={row.id}
                className="flex flex-col items-start gap-3 shadow-none! new-border"
              >
                <div className="flex flex-col gap-0.5 w-full">
                  <div className="flex flex-row items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-text-primary">
                      {row.residentName}
                    </h3>
                    {!row.isRegistered && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        Unregistered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Sitio: {row.sitio ?? "—"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-1.5 w-full">
                    {row.materials.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2"
                      >
                        <MaterialTag
                          type={m.type}
                          materialName={m.name}
                          textOnly
                        />
                        <span className="text-xs text-gray-500 text-nowrap">
                          {m.quantity} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {formatDate(row.intakeDate)}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {row.materials.length}{" "}
                    {row.materials.length === 1 ? "material" : "materials"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
