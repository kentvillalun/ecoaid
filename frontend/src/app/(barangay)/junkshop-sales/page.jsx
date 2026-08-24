"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { DropdownFilter } from "@/components/ui/DropdownFilter";
import { RecordSaleModal } from "@/components/junkshop-sales/modals/RecordSaleModal";
import {
  BuildingStorefrontIcon,
  ArrowUpRightIcon,
  TrophyIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { HoverPortal } from "@/components/ui/HoverReveal";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { Spinner } from "@/components/ui/Spinner";
import { JunkshopDetailModal } from "@/components/junkshop-sales/modals/JunkshopDetailModal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const getBestPriceIndex = (prices) => prices.indexOf(Math.max(...prices));

function BreakdownTable({ materials }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left pb-2 pr-2 font-medium text-gray-400 text-nowrap">
            Material
          </th>
          <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">
            Qty / Weight
          </th>
          <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">
            Price
          </th>
          <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">
            Subtotal
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {materials?.map((m, i) => (
          <tr key={m.id ?? i}>
            <td className="py-2 pr-4">
              <MaterialTag
                type={m?.material?.category?.name}
                materialName={m?.material?.name}
                textOnly={true}
              />
            </td>
            <td className="text-start py-2 pr-1 text-gray-600 tabular-nums text-nowrap lowercase">
              {m.quantity}
              {m.unit === "PIECE" ? "pcs" : m.unit}
            </td>
            <td className="text-start py-2 pr-1 text-gray-400 tabular-nums text-nowrap">
              ₱{m.cost}/{m.unit === "PIECE" ? "pcs" : m.unit}
            </td>
            <td className="text-start py-2 pr-1 font-semibold text-text-primary tabular-nums text-nowrap">
              {formatCurrency(m.quantity * m.cost)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const HISTORY_HEADERS = [
  "Junkshop",
  "Materials",
  "Total Amount",
  "Performed By",
  "Date",
];

export default function JunkshopSalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJunkshopModalOpen, setIsJunkshopModalOpen] = useState(false);
  const [selectedJunkshop, setSelectedJunkshop] = useState("");
  const [salesJunkshopFilter, setSalesJunkshopFilter] = useState("ALL");

  const [salesRefetchCount, setSalesRefetchCount] = useState(0);
  const [preselectedJunkshop, setPreselectedJunkshop] = useState("");
  const {
    data: salesData,
    isLoading: isSalesLoading,
    isError: isSalesError,
  } = useFetch({
    url: `/api/junkshop-sales/`,
    refetchCount: salesRefetchCount,
  });

  const [pricesRefetchCount, setPricesRefetchCount] = useState(0);
  const {
    data: pricesData,
    isLoading: isPricesLoading,
    isError: isPricesError,
  } = useFetch({
    url: `/api/junkshop-sales/prices`,
    refetchCount: pricesRefetchCount,
  });

  const handleSalesRefetchCount = () =>
    setSalesRefetchCount((prev) => prev + 1);

  const handlePricesRefetchCount = () =>
    setPricesRefetchCount((prev) => prev + 1);

  const allPriceItems = pricesData?.junkshops?.flatMap(
    (shop) => shop.priceItems,
  );

  const materialIMap = new Map();
  allPriceItems?.forEach((item) =>
    materialIMap.set(item.material.id, item.material),
  );

  const uniqueMaterials = [...materialIMap.values()];

  const getBestOverallJunkshop = () => {
    const totals = pricesData?.junkshops?.map((shop, i) =>
      shop?.priceItems?.reduce((sum, row) => sum + row.price, 0),
    );
    return pricesData?.junkshops?.[totals?.indexOf(Math.max(...totals))]?.name;
  };

  const bestJunkshop = getBestOverallJunkshop();

  const prices = allPriceItems?.map((item) => item.price);
  const highestPrices = prices ? Math.max(...prices) : 0;

  const salesCountByJunkshopId = new Map();
  salesData?.enrichedSales?.forEach((sale) => {
    const shopId = sale?.junkshop?.id;
    if (!shopId) return;
    salesCountByJunkshopId.set(
      shopId,
      (salesCountByJunkshopId.get(shopId) ?? 0) + 1,
    );
  });

  // Sourced from all junkshops on file (pricesData), not just ones with
  // sales, so a junkshop with zero transactions still shows up as "(0)".
  const salesJunkshopFilterOptions = [
    {
      value: "ALL",
      label: "All",
      count: salesData?.enrichedSales?.length ?? 0,
    },
    ...(pricesData?.junkshops?.map((shop) => ({
      value: shop.id,
      label: shop.name,
      count: salesCountByJunkshopId.get(shop.id) ?? 0,
    })) ?? []),
  ];

  const selectedSalesJunkshopName = pricesData?.junkshops?.find(
    (shop) => shop.id === salesJunkshopFilter,
  )?.name;

  const filteredSales =
    salesJunkshopFilter === "ALL"
      ? salesData?.enrichedSales
      : salesData?.enrichedSales?.filter(
          (sale) => sale?.junkshop?.id === salesJunkshopFilter,
        );

  const salesEmptyText =
    salesJunkshopFilter === "ALL" ? "No sale transactions yet" : "No items";

  const salesEmptySubtext =
    salesJunkshopFilter === "ALL"
      ? "No sales yet. You can press the record sale button above to add sale transaction."
      : `No sales recorded for ${selectedSalesJunkshopName ?? "this junkshop"} yet.`;

  return (
    <Page className="bg-bg! ">
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
              <p className="text-xs font-medium text-text-secondary">
                Junkshops Tracked
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            {isPricesLoading ? (
              <Skeleton width={20} />
            ) : isPricesError ? (
              <p className="md:text-2xl font-bold text-text-primary text-sm">
                Data not available
              </p>
            ) : (
              <p className="md:text-2xl font-bold text-text-primary text-base">
                {pricesData?.junkshops?.length}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <BuildingStorefrontIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Active partners</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">Best Overall</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-xl font-bold text-text-primary text-base leading-tight mt-1 mb-1">
              {isPricesLoading ? (
                <Skeleton width={140} />
              ) : isPricesError ? (
                <p className="md:text-2xl font-bold text-text-primary text-sm">
                  Data not available
                </p>
              ) : (
                bestJunkshop
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <TrophyIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Top performer</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start col-span-2 lg:col-span-1">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">Stat TBD</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-lg select-none">
              {formatCurrency(highestPrices)}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <QuestionMarkCircleIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Placeholder</p>
            </div>
          </Card>
        </section>

        {/* Price Comparison */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Price Comparison"
            subtitle="Price per kg by junkshop and material type"
            icon={<StarIcon className="w-6 stroke-accent" />}
            buttonLabel="Record Sale"
            buttonIcon={<ShoppingBagIcon className="w-5 hidden md:flex" />}
            onAction={() => setIsModalOpen(true)}
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-6 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    <th className="font-medium text-start p-4 text-nowrap">
                      Material
                    </th>
                    {pricesData?.junkshops?.map((shop) => (
                      <th
                        key={shop.id}
                        className="font-medium text-center p-4 text-nowrap"
                      >
                        <button
                          className="inline-flex items-center gap-1 hover:cursor-pointer"
                          onClick={() => {
                            setIsJunkshopModalOpen(true);
                            setSelectedJunkshop(shop.id);
                          }}
                        >
                          {shop.name}
                          <IconContainer
                            icon={
                              <ArrowUpRightIcon className="w-2.5 stroke-text-secondary" />
                            }
                            className="rounded-full! p-1!"
                            containerColor="var(--color-icon-bg)"
                          />
                        </button>
                      </th>
                    ))}
                    <th className="font-medium text-center p-4 text-nowrap text-accent">
                      Best Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isPricesLoading ? (
                    <tr className="max-w-md">
                      <td
                        className="text-center"
                        colSpan={(pricesData?.junkshops?.length ?? 0) + 2}
                      >
                        <Spinner />
                      </td>
                    </tr>
                  ) : isPricesError ? (
                    <tr className="max-w-md">
                      <td
                        className="text-center"
                        colSpan={(pricesData?.junkshops?.length ?? 0) + 2}
                      >
                        <Error
                          handleRefetchCount={handlePricesRefetchCount}
                          subtext={
                            "Unable to get price comparison data. Please try again."
                          }
                        />
                      </td>
                    </tr>
                  ) : pricesData?.junkshops?.length === 0 ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={2}>
                        <Empty
                          text={"No price data available"}
                          subtext={
                            "No junkshop price data found. Price data will appear here once added."
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    uniqueMaterials?.map((row) => {
                      const prices = pricesData?.junkshops?.map((shop) => {
                        const p = shop?.priceItems.find(
                          (item) => item.material.id === row.id,
                        );
                        return p?.price;
                      });
                      const normalizedPrices = prices.map(p => p ?? 0)
                      const bestIdx = getBestPriceIndex(normalizedPrices);
                      const bestPrice = Math.max(...normalizedPrices);
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-bg transition-all duration-150"
                        >
                          <td className="p-4">
                            <MaterialTag
                              type={row.category.name}
                              materialName={row.name}
                              textOnly={true}
                            />
                          </td>
                          {pricesData?.junkshops?.map((shop, i) => {
                            const priceItem = shop?.priceItems?.find(
                              (p) => p.material.id === row.id,
                            );

                            return (
                              <td
                                key={shop.id ?? i}
                                className="p-2 text-center"
                              >
                                <div
                                  className={`inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 hover:cursor-pointer w-full
                                ${i === bestIdx ? "hover:bg-green-100" : "hover:bg-gray-100"}`}
                                >
                                  <span
                                    className={`font-semibold tabular-nums ${i === bestIdx ? "text-green-800 text-base" : "text-text-primary"}`}
                                  >
                                    {priceItem?.price
                                      ? `₱${priceItem.price}`
                                      : "—"}
                                  </span>
                                  {i === bestIdx && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                      <CheckCircleIcon className="w-3 h-3 text-green-600" />
                                      Best price
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-4 text-center bg-accent/2">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-bold text-accent text-base tabular-nums">
                                ₱{bestPrice}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {
                                  pricesData?.junkshops?.[bestIdx]?.name.split(
                                    " ",
                                  )[0]
                                }
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile price cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {isPricesLoading ? (
              <Card className="shadow-none! new-border flex-col! items-start! gap-3">
                <div className="flex flex-row items-center justify-between w-full">
                  <Skeleton width={180} />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {}}
                    className={`flex flex-row items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 hover:cursor-pointer w-full text-left
                          `}
                  >
                    <Skeleton width={200} />
                    <Skeleton width={100} />
                  </button>
                </div>
              </Card>
            ) : isPricesError ? (
              <Error
                handleRefetchCount={handlePricesRefetchCount}
                subtext={
                  "Unable to get price comparison data. Please try again."
                }
              />
            ) : pricesData?.junkshops?.length === 0 ? (
              <Empty
                text={"No price data available"}
                subtext={
                  "No junkshop price data found. Price data will appear here once added."
                }
              />
            ) : (
              uniqueMaterials?.map((row) => {
                const prices = pricesData?.junkshops?.map((shop) => {
                  const p = shop?.priceItems.find(
                    (item) => item.material.id === row.id,
                  );
                  return {
                    price: p?.price,
                    unit: p?.unit,
                  };
                });

                const bestIdx = getBestPriceIndex(prices.map((p) => p.price ?? 0));

                return (
                  <Card
                    key={row.id}
                    className="shadow-none! new-border flex-col! items-start! gap-3"
                  >
                    <div className="flex flex-row items-center justify-between w-full">
                      <MaterialTag
                        type={row.category.name}
                        materialName={row.name}
                        textOnly={true}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      {pricesData?.junkshops?.map((shop, i) => (
                        <div
                          key={shop.id}
                          type="button"
                          className={`flex flex-row items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 hover:cursor-pointer w-full text-left
                          ${i === bestIdx ? "bg-green-50" : ""}`}
                        >
                          <button
                            className={`inline-flex items-center gap-1 text-sm font-medium text-start ${i === bestIdx ? "text-green-800" : "text-text-secondary"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJunkshop(shop.id);
                              setIsJunkshopModalOpen(true);
                            }}
                          >
                            {shop.name}
                            {/* <IconContainer
                              icon={
                                <ArrowUpRightIcon className="w-2.5 stroke-text-secondary" />
                              }
                              className="rounded-full! p-1!"
                              containerColor="var(--color-icon-bg)"
                            /> */}
                          </button>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold tabular-nums  ${i === bestIdx ? "text-green-800" : "text-text-primary"}`}
                            >
                              {prices[i]?.price ? (
                                <div>
                                  ₱{prices[i].price}
                                  <span className="font-normal text-xs lowercase">
                                    /
                                    {prices[i].unit === "PIECE"
                                      ? "pcs"
                                      : prices[i].unit}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-text-primary">
                                  —
                                </span>
                              )}
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
              })
            )}
          </div>
        </section>

        {/* Sales History */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Sales History"
            subtitle="Recent transactions across junkshops"
            icon={
              <ClipboardDocumentListIcon className="w-6 stroke-accent" />
            }
            noButton
          />

          <DropdownFilter
            id="salesJunkshopFilter"
            options={salesJunkshopFilterOptions}
            value={salesJunkshopFilter}
            onChange={setSalesJunkshopFilter}
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {HISTORY_HEADERS.map((h) => (
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
                  {isSalesLoading ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={5}>
                        <Spinner />
                      </td>
                    </tr>
                  ) : isSalesError ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={5}>
                        <Error
                          handleRefetchCount={handleSalesRefetchCount}
                          subtext={
                            "Unable to get your sales history. Please try again."
                          }
                        />
                      </td>
                    </tr>
                  ) : filteredSales?.length === 0 ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={5}>
                        <Empty
                          text={salesEmptyText}
                          subtext={salesEmptySubtext}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredSales?.map((row) => {
                      const visible = row?.saleItems?.slice(0, 2);
                      const hidden = row?.saleItems?.slice(2);
                      return (
                        <tr
                          key={row.id}
                          className="text-start hover:bg-bg transition-all duration-150"
                        >
                          <td className="p-4 font-medium text-text-primary text-nowrap">
                            {row?.junkshop?.name}
                          </td>
                          <td className="p-4">
                            <HoverPortal
                              content={
                                <BreakdownTable materials={row?.saleItems} />
                              }
                            >
                              {visible.map((m) => (
                                <MaterialTag
                                  key={m?.id}
                                  type={m?.material?.category?.name}
                                  materialName={m?.material?.name}
                                />
                              ))}

                              {hidden.length > 0 && (
                                <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full bg-gray-100 select-none">
                                  +{hidden.length} more
                                </span>
                              )}
                            </HoverPortal>
                          </td>
                          <td className="p-4 font-bold text-text-primary tabular-nums text-nowrap">
                            {formatCurrency(row.totalAmount)}
                          </td>
                          <td className="p-4 text-nowrap">
                            <div className="flex flex-col">
                              <p className="text-text-primary font-medium">
                                {row.performedBy}
                              </p>
                              {row?.performedByRole && (
                                <p className="text-xs text-gray-400 capitalize">
                                  {row.performedByRole.toLowerCase()}
                                </p>
                              )}
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
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {isSalesLoading ? (
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <div className="flex flex-row items-center justify-between w-full">
                  <Skeleton width={180} />
                  <Skeleton width={100} />
                </div>
                <div className="w-full grid grid-cols-5 gap-1">
                  <div className="col-span-2">
                    <Skeleton width={175} />
                  </div>
                  <Skeleton width={60} />
                  <Skeleton width={60} />
                  <Skeleton width={60} />
                </div>
                <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                  <Skeleton width={160} />
                  <Skeleton width={180} />
                </div>
              </Card>
            ) : isSalesError ? (
              <Error
                handleRefetchCount={handleSalesRefetchCount}
                subtext={"Unable to get your sales history. Please try again."}
              />
            ) : filteredSales?.length === 0 ? (
              <Empty text={salesEmptyText} subtext={salesEmptySubtext} />
            ) : (
              filteredSales?.map((row, i) => (
                <Card
                  key={row.id ?? i}
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="text-sm font-semibold text-text-primary">
                      {row.junkshop.name}
                    </p>
                    <p className="text-sm font-bold text-accent tabular-nums">
                      {formatCurrency(row.totalAmount)}
                    </p>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <BreakdownTable materials={row.saleItems} />
                  </div>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {formatDate(row.createdAt)}
                    </p>
                    <div className="flex flex-col items-end">
                      <p className="text-xs font-medium text-text-primary">
                        {row.performedBy}
                      </p>
                      {row?.performedByRole && (
                        <p className="text-xs text-gray-400 capitalize">
                          {row.performedByRole.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Modal */}
        <RecordSaleModal
          isOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          preselectedJunkshopId={preselectedJunkshop}
          junkshops={pricesData?.junkshops}
          setPreselectedJunkshop={setPreselectedJunkshop}
          setSalesRefetchCount={setSalesRefetchCount}
        />

        <JunkshopDetailModal
          isOpen={isJunkshopModalOpen}
          onClose={() => {
            setIsJunkshopModalOpen(false);
            setSelectedJunkshop("");
          }}
          junkshop={selectedJunkshop}
          setIsJunkshopModalOpen={setIsJunkshopModalOpen}
          setIsModalOpen={setIsModalOpen}
          setPreselectedJunkshop={setPreselectedJunkshop}
        />
      </PageContent>
    </Page>
  );
}
