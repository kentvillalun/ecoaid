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
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Error } from "@/components/ui/Error";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/formatDate";
import { Empty } from "@/components/ui/Empty";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// ─── Style Maps ───────────────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  Plastics: {
    headerBg: "bg-blue-50",
    divider: "border-blue-100",
    dot: "bg-blue-400",
    text: "text-blue-700",
  },
  Papers: {
    headerBg: "bg-yellow-50",
    divider: "border-yellow-100",
    dot: "bg-yellow-400",
    text: "text-yellow-700",
  },
  Metals: {
    headerBg: "bg-gray-50",
    divider: "border-gray-200",
    dot: "bg-gray-400",
    text: "text-gray-600",
  },
  Glass: {
    headerBg: "bg-cyan-50",
    divider: "border-cyan-100",
    dot: "bg-cyan-400",
    text: "text-cyan-700",
  },
  default: {
    headerBg: "bg-icon-bg",
    divider: "border-border",
    dot: "bg-muted-accent",
    text: "text-text-secondary",
  },
};

const TABLE_HEADERS = [
  "Material",
  "Quantity",
  "Current Total",
  "Source",
  "Date",
];

const VIEW_OPTIONS = [
  { key: "log", label: "Stock Movements" },
  { key: "overview", label: "Category Overview" },
];

const KG_TO_LBS = 2.20462;

function applyUnit(quantity, unit, displayUnit) {
  if (unit === "PIECE") return { qty: quantity, label: "pcs" };
  if (displayUnit === "lbs")
    return { qty: (quantity * KG_TO_LBS).toFixed(2), label: "lbs" };
  return { qty: quantity.toFixed(3), label: "kg" };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function UnitToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
        Unit
      </span>
      <div className="flex flex-row bg-surface new-border rounded-xl p-0.5 gap-0.5">
        {["kg", "lbs"].map((u) => (
          <button
            key={u}
            onClick={() => onChange(u)}
            className={`
              text-xs px-4 py-1.5 rounded-[9px] font-semibold
              transition-all duration-200 hover:cursor-pointer
              ${
                value === u
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

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex flex-row bg-surface new-border rounded-xl p-0.5 gap-0.5">
      {VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`
            text-xs px-4 py-1.5 rounded-[9px] font-semibold text-nowrap
            transition-all duration-200 hover:cursor-pointer
            ${
              value === opt.key
                ? "gradient-button text-white"
                : "text-gray-400 hover:text-gray-600"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MaterialFilter({ value, onChange, categorizedMaterials }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row text-gray-600 text-sm items-center justify-center gap-1">
        <FunnelIcon className="w-4" />
        <p>Filter:</p>
      </div>
      <div className="bg-surface new-border rounded-xl px-3 py-1.5 text-sm text-gray-600 outline-none hover:cursor-pointer max-w-50">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="outline-none">
          <option value="ALL">All materials</option>
          {categorizedMaterials.map((cat) => (
            <optgroup label={cat.name} key={cat.name}>
              {[...new Map(cat.materials.map((m) => [m.materialId, m])).values()].map(
                (m) => (
                  <option key={m.materialId} value={m.materialId}>
                    {m.materialName}
                  </option>
                ),
              )}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}

function CategoryCard({ cat, displayUnit }) {
  const styles = CATEGORY_STYLES[cat.name] ?? CATEGORY_STYLES.default;

  const totalKg = cat.materials
    .filter((m) => m.unit === "KG")
    .reduce((s, m) => s + m.balance, 0);
  const totalPcs = cat.materials
    .filter((m) => m.unit === "PIECE")
    .reduce((s, m) => s + m.balance, 0);

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
          <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
          <h4 className={`font-semibold text-sm ${styles.text}`}>{cat.name}</h4>
          <span className="text-xs text-gray-400 font-normal">
            {cat.materials.length === 0
              ? "No materials yet"
              : `${cat.materials.length} ${cat.materials.length !== 1 ? "materials" : "material"}`}
          </span>
        </div>
        <span className={`text-xs font-semibold ${styles.text}`}>
          {summaryParts.join(" · ")}
        </span>
      </div>

      {/* Material rows */}
      <div className="flex flex-col w-full divide-y divide-gray-50 px-5">
        {cat.materials.length === 0 ? (
          <span>There are no materials being stored for this category yet</span>
        ) : (
          cat.materials.map((m) => {
            const { qty, label } = applyUnit(m?.balance, m?.unit, displayUnit);
            return (
              <div
                key={`${m?.materialId}_${m?.unit}`}
                className="flex items-center justify-between py-3.5"
              >
                <span className="text-sm text-text-primary font-medium">
                  {m?.materialName}
                </span>
                <span className="text-sm font-bold text-text-primary tabular-nums">
                  {qty}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    {label}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaterialStockPage() {
  const [displayUnit, setDisplayUnit] = useState("kg");
  const [activeView, setActiveView] = useState("log");
  const [materialFilter, setMaterialFilter] = useState("ALL");
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/mrf-inventory/",
    refetchCount,
  });

  const [transactionRefetchCount, setTransactionRefetchCount] = useState(0);
  const {
    data: transactionLogsData,
    isLoading: isTransactionLogsLoading,
    isError: isTransactionLogsError,
  } = useFetch({
    url: "/api/mrf-inventory/transaction-logs",
    refetchCount: transactionRefetchCount,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [isSelectedMaterialIdError, setIsSelectedMaterialIdError] =
    useState(false);
  const [isQuantityError, setIsQuantityError] = useState(false);
  const { makeRequest } = useMutation();

  const selectedMaterial = data?.enrichedResults?.find(
    (e) => e.materialId === selectedMaterialId,
  );

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const handleTransactionRefetchCount = () =>
    setTransactionRefetchCount((prev) => prev + 1);

  const categorizedMaterials = data?.enrichedResults?.reduce((acc, item) => {
    const key = item.category;

    if (!acc[key]) {
      acc[key] = { name: key, materials: [] };
    }
    acc[key].materials.push(item);

    return acc;
  }, {});

  const results = Object.values(categorizedMaterials ?? {});

  const filteredTransactionLogs = transactionLogsData?.transactionLogs?.filter(
    (row) => materialFilter === "ALL" || row.materialId === materialFilter,
  );

  const ALL_MATERIALS = data?.enrichedResults;
  const TOTAL_WEIGHT_KG = ALL_MATERIALS?.filter((m) => m?.unit === "KG").reduce(
    (s, m) => s + m?.balance,
    0,
  );
  const TOTAL_PCS = ALL_MATERIALS?.filter((m) => m?.unit === "PIECE").reduce(
    (s, m) => s + m?.balance,
    0,
  );

  const totalWeightDisplay =
    displayUnit === "lbs"
      ? `${(TOTAL_WEIGHT_KG * KG_TO_LBS).toFixed(3)} lbs`
      : `${TOTAL_WEIGHT_KG?.toFixed(3)} kg`;

  const onSubmit = async () => {
    if (!selectedMaterialId) {
      return setIsSelectedMaterialIdError(true);
    }

    if (!quantity) {
      return setIsQuantityError(true);
    }

    toast.loading("Creating stock out transaction");

    const success = await makeRequest({
      url: "/api/mrf-inventory/transaction-logs/out",
      body: {
        materialId: selectedMaterialId,
        quantity: parseFloat(quantity),
        unit: selectedMaterial?.unit === "PIECE" ? "PIECE" : "KG",
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Stock out transaction created");
      handleTransactionRefetchCount();
      handleRefetchCount();
      resetModal();
    } else {
      toast.dismiss();
      toast.error("Creating stock out transaction failed");
    }
  };

  const resetModal = () => {
    setSelectedMaterialId("");
    setQuantity(0);
    setIsSelectedMaterialIdError(false);
    setIsQuantityError(false);
    setIsModalOpen(false);
  };

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="MRF Inventory" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header */}
        <BarangayHeaderCard
          title="MRF Inventory"
          subtitle="Overview of collected recyclable materials"
        />

        {isModalOpen &&
          createPortal(
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              icon={<ArrowUpTrayIcon className="w-6 stroke-accent" />}
              title={"Record stock out"}
              subtitle={"Please input details for your stock out transaction"}
              confirmLabel={"Record stock out"}
              confirmClassName={"gradient-button"}
              onConfirm={() => onSubmit()}
            >
              <div className="p-6 flex flex-col gap-3 ">
                <div className="flex flex-col gap-1">
                  <label htmlFor="materialId" className="label">
                    Material
                  </label>
                  <div className="input">
                    <select
                      name=""
                      id=""
                      className="w-full outline-none"
                      defaultValue=""
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                    >
                      <option value="" className="" disabled hidden>
                        Select material
                      </option>
                      {data?.enrichedResults?.map((e, index) => (
                        <option value={e?.materialId} className="" key={index}>
                          {e?.materialName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isSelectedMaterialIdError && (
                    <p className="text-xs text-red-500">Material is required</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="quantity" className="label">
                      {selectedMaterial?.unit === "PIECE"
                        ? "Quantity"
                        : "Amount"}
                    </label>
                    <input
                      type="number"
                      className="input"
                      id="quantity"
                      placeholder={`Enter ${selectedMaterial?.unit === "PIECE" ? "quantity" : "amount"} to deduct`}
                      onChange={(e) => setQuantity(e.target.value)}
                      min={0}
                    />
                    {isQuantityError && (
                      <p className="text-xs text-red-500">
                        {selectedMaterial?.unit === "PIECE"
                          ? "Quantity"
                          : "Amount"}{" "}
                        is required
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="unit" className="label">
                      Unit
                    </label>
                    <input
                      type="text"
                      className="input disabled:bg-gray-100 lowercase"
                      id="unit"
                      value={
                        selectedMaterial?.unit === "PIECE" ? "PIECE" : "KG"
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>
            </Modal>,
            document.body,
          )}

        <section className="grid grid-cols-2 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Weight
              </p>
              <IconContainer
                icon={
                  <ArrowUpRightIcon className="w-3 stroke-text-secondary" />
                }
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {isLoading ? (
                <Skeleton width={150} />
              ) : isError ? (
                <span className="text-gray-400 ">Unable to load</span>
              ) : (
                <span className="">{totalWeightDisplay}</span>
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-2">
              <ScaleIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">All categories</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Pieces
              </p>
              <IconContainer
                icon={
                  <ArrowUpRightIcon className="w-3 stroke-text-secondary" />
                }
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {isLoading ? (
                <Skeleton width={150} />
              ) : isError ? (
                <span className="text-gray-400">Unable to load</span>
              ) : (
                <span className="">{TOTAL_PCS} pcs</span>
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-2">
              <CubeIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Piece-based materials</p>
            </div>
          </Card>
        </section>
        <div className="flex flex-row items-center justify-between flex-wrap gap-3">
          <ViewToggle value={activeView} onChange={setActiveView} />
          <UnitToggle value={displayUnit} onChange={setDisplayUnit} />
        </div>

        {activeView === "overview" && (
          <>
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Category Overview"
                subtitle="Recyclable materials grouped by category"
                icon={<ArchiveBoxIcon className="w-6 stroke-accent" />}
                noButton
              />

              {isLoading ? (
                <Spinner className="p-10! min-h-auto!" />
              ) : isError ? (
                <Error
                  subtext={
                    "Unable to get the stock overview for every category. Please try again."
                  }
                  handleRefetchCount={handleRefetchCount}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((cat) => (
                    <CategoryCard
                      key={cat.name}
                      cat={cat}
                      displayUnit={displayUnit}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === "log" && (
          <>
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Stock Movements"
                subtitle="History of all stock movements"
                icon={<Bars3BottomLeftIcon className="w-6 stroke-accent" />}
                buttonLabel="Stock Out"
                buttonIcon={<ArrowUpTrayIcon className="w-5 hidden md:flex" />}
                onAction={() => setIsModalOpen((prev) => !prev)}
              />

              <MaterialFilter
                value={materialFilter}
                onChange={setMaterialFilter}
                categorizedMaterials={results}
              />

              {/* Desktop table */}
              <Card
                className={`${inter.className} hidden md:flex md:flex-col px-8 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
              >
                <table className="w-full text-sm border-collapse text-gray-600 overflow-x-auto">
                  <thead className="border-b border-border">
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
                    {isTransactionLogsLoading ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={TABLE_HEADERS.length}
                        >
                          <Spinner className="min-h-auto! p-12!" />
                        </td>
                      </tr>
                    ) : isTransactionLogsError ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={TABLE_HEADERS.length}
                        >
                          <Error
                            handleRefetchCount={handleTransactionRefetchCount}
                            text={"Unable to get transaction logs"}
                            subtext={
                              "Unable to get stock transaction logs. Please try again."
                            }
                          />
                        </td>
                      </tr>
                    ) : transactionLogsData?.transactionLogs?.length === 0 ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={TABLE_HEADERS.length}
                        >
                          <Empty
                            text={"No transaction logs yet"}
                            subtext={
                              "No stock transaction logs yet. You can add by making transaction in (Pickup Request, Manual Intake, Redemption modules, or just press the stock out button to reduce "
                            }
                          />
                        </td>
                      </tr>
                    ) : filteredTransactionLogs?.length === 0 ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={TABLE_HEADERS.length}
                        >
                          <Empty
                            text={"No stock movements found"}
                            subtext={
                              "No stock movements match the selected material filter."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredTransactionLogs?.map((row) => {
                        const { qty, label } = applyUnit(
                          row.quantity,
                          row.unit,
                          displayUnit,
                        );
                        const { qty: totalQty, label: totalLabel } = applyUnit(
                          row.currentTotal,
                          row.unit,
                          displayUnit,
                        );
                        return (
                          <tr
                            key={row.id}
                            className="text-start hover:bg-bg transition-all duration-150"
                          >
                            <td className="p-4">
                              <MaterialTag
                                textOnly={true}
                                type={row?.material?.category?.name}
                                materialName={row?.material?.name}
                              />
                            </td>
                            <td className="p-4 font-semibold text-text-primary tabular-nums">
                              {qty}
                              <span className="text-xs font-normal text-gray-400 ml-1">
                                {label}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-text-primary tabular-nums">
                              {totalQty}
                              <span className="text-xs font-normal text-gray-400 ml-1">
                                {totalLabel}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 text-nowrap flex flex-row gap-1 items-center ">
                              <p className=" capitalize">
                                {row.source.split("_").join(" ").toLowerCase()}
                              </p>
                              <div
                                className={`capitalize font-semibold rounded-2xl text-xs px-2.5 py-0.5  ${row.transactionType === "IN" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} flex flex-row gap-1`}
                              >
                                <p className="">
                                  {row.transactionType === "IN"
                                    ? "Stock in"
                                    : "Stock out"}
                                </p>
                              </div>
                            </td>
                            <td className="p-4 text-nowrap text-gray-400 text-xs">
                              {formatDate(row.createdAt)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </Card>

              {/* Mobile cards */}
              <div className="flex md:hidden flex-col gap-2">
                {isTransactionLogsLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card
                      key={index}
                      className="flex flex-col items-start gap-3 shadow-none! new-border"
                    >
                      <div className="flex flex-row items-center justify-between w-full">
                        <Skeleton width={168} />
                        <Skeleton width={100} />
                      </div>
                      <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                        <Skeleton width={155} />
                        <Skeleton width={80} />
                      </div>
                    </Card>
                  ))
                ) : isTransactionLogsError ? (
                  <Error
                    handleRefetchCount={handleTransactionRefetchCount}
                    text={"Unable to get transaction logs"}
                    subtext={
                      "Unable to get stock transaction logs. Please try again."
                    }
                  />
                ) : transactionLogsData?.transactionLogs?.length === 0 ? (
                  <Empty
                    text={"No transaction logs yet"}
                    subtext={
                      "No stock transaction logs yet. You can add by making transaction in (Pickup Request, Manual Intake, Redemption modules, or just press the stock out button to reduce "
                    }
                  />
                ) : filteredTransactionLogs?.length === 0 ? (
                  <Empty
                    text={"No stock movements found"}
                    subtext={
                      "No stock movements match the selected material filter."
                    }
                  />
                ) : (
                  filteredTransactionLogs?.map((row) => {
                    const { qty, label } = applyUnit(
                      row.quantity,
                      row.unit,
                      displayUnit,
                    );
                    const { qty: totalQty, label: totalLabel } = applyUnit(
                      row.currentTotal,
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
                            type={row?.material?.category?.name}
                            materialName={row?.material?.name}
                          />
                          <div className="flex flex-row gap-1 items-center">
                            <span className="text-xs text-gray-500 capitalize">
                              {row.source.split("_").join(" ").toLowerCase()}
                            </span>
                            <div
                              className={`capitalize font-medium rounded-2xl text-xs px-2.5 py-0.5  ${row.transactionType === "IN" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} flex flex-row gap-1`}
                            >
                              <p className="">
                                {row.transactionType === "IN"
                                  ? "Stock in"
                                  : "Stock out"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            {formatDate(row.createdAt)}
                          </p>
                          <p className="text-sm font-bold text-text-primary tabular-nums">
                            {qty}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              {label}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-row items-center justify-between w-full">
                          <p className="text-xs text-gray-400">Current total</p>
                          <p className="text-xs font-semibold text-text-primary tabular-nums">
                            {totalQty}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              {totalLabel}
                            </span>
                          </p>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </PageContent>
    </Page>
  );
}
