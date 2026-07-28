"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/lib/formatDate";
import {
  Bars3BottomLeftIcon,
  InboxArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { HoverPortal } from "@/components/ui/HoverReveal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TABLE_HEADERS = ["Resident Name", "Sitio", "Materials", "Intake Date"];


function ResidentNameCell({ name, isRegistered = true }) {
  return (
    <div className="flex flex-row items-center gap-2 flex-wrap">
      <p className="font-semibold text-text-primary text-nowrap">{name}</p>
      {!isRegistered && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-nowrap">
          No Account
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
    const removed = materialRows.filter((_, i) => i !== index);
    setMaterialRows(removed);
  };

  const updateRow = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;
    setMaterialRows(updated);
  };

  const [name, setName] = useState("");
  const [residentsList, setResidentsList] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [IsSearchError, setIsSearchError] = useState(false);
  const [searchError, setSearchError] = useState("");
  const timer = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const { data } = useFetch({
    url: "/api/material/barangay",
    refetchCount: materialRefetchCount,
  });
  const { makeRequest } = useMutation();
  const [householdName, setHouseholdName] = useState("");
  const [transactionsRefetchCount, setTransactionsRefetchCount] = useState(0);
  const {
    data: transactionsData,
    isLoading,
    isError,
  } = useFetch({
    url: "/api/manual-intake/",
    refetchCount: transactionsRefetchCount,
  });

  const handleTransactionRefetchCount = () =>
    setTransactionsRefetchCount((prev) => prev + 1);

  const onSubmit = async () => {
    if (!selectedResident && !householdName.trim()) {
      return toast.error(
        "Please select a resident or enter a household/ resident name",
      );
    }

    if (
      materialRows.length === 0 ||
      materialRows.some((row) => !row.materialId || !row.amount || !row.unit)
    ) {
      return toast.error(
        "Creation failed. Please add at least one material item",
      );
    }

    toast.loading("Creating intake transaction");

    const success = await makeRequest({
      url: "/api/manual-intake/",
      body: {
        userId: selectedResident?.id,
        householdName,
        items: materialRows.map((row) => ({
          materialId: row.materialId,
          quantity: parseFloat(row.amount),
          unit: row.unit,
        })),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Intake transaction created");
      handleTransactionRefetchCount();
      resetModal();
    } else {
      toast.dismiss();
      toast.error("Creating intake transaction failed");
    }
  };

  const resetModal = () => {
    setName("");
    setResidentsList([]);
    setIsSearchLoading(false);
    setIsSearchError(false);
    setSearchError("");
    setShowDropdown(false);
    setSelectedResident(null);
    setSearchTerm("");
    setMaterialRows([{ materialId: "", amount: "", unit: "" }]);
    setShowHousehold(false);
    setIsModalOpen(false);
  };

  const searchResidents = async (name) => {
    try {
      setIsSearchLoading(true);
      setIsSearchError(false);

      const response = await fetch(`/api/resident/search?name=${name.trim()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setSearchError("There is a problem searching residents");
        setIsSearchError(true);
        return;
      }

      setIsSearchLoading(false);
      setResidentsList(result.users);

      if (result.users.length === 0) setShowHousehold(true);

      setShowDropdown(true);
      return true;
    } catch (error) {
      setIsSearchError(true);
      setSearchError("Fetching failed");
      return false;
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef?.current?.contains(e.target)) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);



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
              onClose={() => {
                resetModal();
                setIsModalOpen(false);
              }}
              icon={<InboxArrowDownIcon className="w-6 stroke-new-primary" />}
              title={"Record Intake"}
              subtitle={
                "Record collected materials for a resident or household."
              }
              confirmLabel={"Record Intake"}
              confirmClassName={"gradient-button"}
              onConfirm={() => onSubmit()}
            >
              <div className="flex flex-col gap-3 p-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="searchResident" className="label">
                    Resident
                  </label>
                  <div className="flex flex-row relative w-full outline-1 py-2.5  text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11">
                    <input
                      type="text"
                      className="w-full outline-none px-3.5"
                      id="searchResident"
                      placeholder="Search and select resident name"
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!e.target.value) {
                          setShowDropdown(false);
                          setResidentsList([]);
                        } else {
                          setShowHousehold(false);
                          if (selectedResident !== null)
                            setSelectedResident(null);
                          clearTimeout(timer.current);
                          timer.current = setTimeout(() => {
                            searchResidents(e.target.value);
                          }, 500);
                        }
                      }}
                      value={searchTerm}
                      onFocus={() => {
                        if (residentsList.length > 0 || searchTerm)
                          setShowDropdown(true);
                      }}
                    />
                    {selectedResident !== null && (
                      <button
                        className="pr-3.5 hover:cursor-pointer"
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedResident(null);
                          setResidentsList([]);
                        }}
                      >
                        <XMarkIcon className="w-5 stroke-gray-400" />
                      </button>
                    )}
                    {showDropdown && (
                      <div
                        className="absolute bg-white flex flex-col w-full items-start z-40 rounded-lg new-border text-sm py-2.5 top-11.5"
                        ref={dropdownRef}
                      >
                        {residentsList.length === 0 ? (
                          <div className="px-3.5 w-full py-1">
                            No residents found. You may enter a household name
                            below.
                          </div>
                        ) : (
                          residentsList.map((r) => (
                            <div
                              className="px-3.5 hover:cursor-pointer hover:bg-gray-50 w-full py-1"
                              key={r.id}
                              onClick={() => {
                                setSelectedResident({
                                  id: r.id,
                                  displayName: `${r.firstName} ${r.lastName}`,
                                });
                                setSearchTerm(`${r.firstName} ${r.lastName}`);
                                setShowDropdown(false);
                              }}
                            >
                              <p className="">
                                {r.firstName} {r.lastName}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
                      onChange={(e) => setHouseholdName(e.target.value)}
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
                            Material {index + 1}
                          </span>
                          <button
                            type="button"
                            className="hover:cursor-pointer"
                            onClick={() => {
                              removeRow(index);
                            }}
                          >
                            <XMarkIcon className="w-5 stroke-gray-400" />
                          </button>
                        </div>

                        <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2">
                          <select
                            className="w-full outline-none"
                            onChange={(e) =>
                              updateRow(index, "materialId", e.target.value)
                            }
                            defaultValue=""
                          >
                            <option value="" disabled hidden>
                              Select material
                            </option>
                            {data?.materials?.map((m) => (
                              <option value={m.id} className="" key={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-row gap-2">
                          <div className="flex-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11">
                            <input
                              type="number"
                              className="outline-none w-full"
                              placeholder="Amount, e.g. 20"
                              onChange={(e) => {
                                updateRow(index, "amount", e.target.value);
                              }}
                            />
                          </div>
                          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 min-w-28">
                            <select
                              className="w-full outline-none"
                              onChange={(e) => {
                                updateRow(index, "unit", e.target.value);
                              }}
                            >
                              <option value="" disabled hidden>
                                Unit
                              </option>
                              <option value={"KG"}>kg</option>
                              <option value={"LBS"}>lbs</option>
                              <option value={"GRAMS"}>grams</option>
                              <option value={"PIECE"}>piece</option>
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
                  <p className="text-gray-700">Add material</p>
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
            <table className="w-full text-sm border-collapse text-gray-600 overflow-x-auto">
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
                {isLoading ? (
                  <tr className="max-w-md">
                    <td className="text-center" colSpan={4}>
                      <Spinner />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr className="max-w-md">
                    <td className="text-center" colSpan={4}>
                      <Error
                        handleRefetchCount={handleTransactionRefetchCount}
                        text={"Unable to get your intake transactions"}
                      />
                    </td>
                  </tr>
                ) : transactionsData?.transactions?.length === 0 ? (
                  <tr className="max-w-md">
                    <td className="text-center" colSpan={9}>
                      <Empty
                        text={"No items"}
                        subtext={
                          "There are no intake transactions yet. Please tap the record intake button to make a trasaction."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  transactionsData?.transactions?.map((row) => (
                    <tr
                      key={row.id}
                      className="text-start hover:bg-[#f8f8f8] transition-all transform"
                    >
                      <td className="p-4">
                        {row.user ? (
                          <ResidentNameCell
                            name={`${row?.user?.firstName} ${row?.user?.lastName}`}
                          />
                        ) : (
                          <ResidentNameCell
                            name={row?.householdName}
                            isRegistered={false}
                          />
                        )}
                      </td>
                      <td className="p-4 text-nowrap">
                        {row?.user?.sitio?.name ?? "—"}
                      </td>
                      <td className="p-4">
                        <HoverPortal
                          content={
                            <>
                              <p className="text-xs font-semibold text-gray-500 mb-2">
                                Materials & Quantity
                              </p>
                              <div className="flex flex-col gap-1">
                                {row?.manualIntakeItems?.map((m) => (
                                  <div
                                    key={m?.id}
                                    className="flex items-center justify-between gap-6"
                                  >
                                    <MaterialTag
                                      type={m?.material?.category?.name}
                                      materialName={m?.material?.name}
                                      textOnly
                                    />
                                    <span className="text-xs text-gray-500 text-nowrap lowercase">
                                      {m?.quantity}{" "}
                                      {m?.unit === "PIECE" ? "pcs" : m?.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </>
                          }
                        >
                          {row?.manualIntakeItems?.map((m) => (
                            <MaterialTag
                              key={m.id}
                              type={m?.material?.category?.name}
                              materialName={m?.material?.name}
                            />
                          ))}
                        </HoverPortal>
                      </td>
                      <td className="p-4 text-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                  key={index}
                >
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                      <Skeleton width={200} />
                      <Skeleton width={115} />
                    </div>
                    <Skeleton width={80} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-1.5 w-full">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2"
                        >
                          <Skeleton width={130} />
                          <Skeleton width={60} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <Skeleton width={175} />
                    <Skeleton width={95} />
                  </div>
                </Card>
              ))
            ) : isError ? (
              <Error handleRefetchCount={handleTransactionRefetchCount} />
            ) : transactionsData?.transactions?.length === 0 ? (
              <Empty
                text={"No items"}
                subtext={
                  "There are no intake transactions yet. Please tap the record intake button to make a trasaction."
                }
              />
            ) : (
              transactionsData?.transactions?.map((row) => (
                <Card
                  key={row.id}
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                >
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary">
                        {row?.user
                          ? `${row?.user?.firstName} ${row?.user?.lastName}`
                          : row?.householdName}
                      </h3>
                      {!row?.user && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          No Account
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Sitio: {row?.user?.sitio?.name ?? "—"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-1.5 w-full">
                      {row?.manualIntakeItems?.map((m) => (
                        <div
                          key={m?.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <MaterialTag
                            type={m?.material?.category?.name}
                            materialName={m?.material?.name}
                            textOnly
                          />
                          <span className="text-xs text-gray-500 text-nowrap lowercase">
                            {m?.quantity}{" "}
                            {m?.unit === "PIECE" ? "pcs" : m?.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {formatDate(row?.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {row?.manualIntakeItems?.length}{" "}
                      {row?.manualIntakeItems?.length === 1
                        ? "material"
                        : "materials"}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
