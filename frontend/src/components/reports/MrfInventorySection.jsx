"use client";

import { useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { DateRangePicker, getDefaultDateRange } from "./DateRangePicker";
import { formatReportDate } from "@/lib/formatReportDate";
import { useFetch } from "@/hooks/useFetch";

const MATERIAL_STOCK_HEADERS = [
  "Date",
  "Material",
  "Quantity In",
  "Quantity Out",
  "Net",
];

export const MrfInventorySection = ({dateRange, setDateRange}) => {
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, isLoading, isError } = useFetch({
    url: `/api/reports?type=mrf-inventory&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const results = data?.results ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="MRF Inventory"
        subtitle="Recyclable material movement in and out of the MRF"
        icon={<CubeIcon className="w-6 stroke-accent" />}
        noButton
      />

      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={setDateRange}
      />

      {/* Desktop table */}
      <Card className="hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse text-gray-600">
            <thead className="border-b border-border">
              <tr>
                {MATERIAL_STOCK_HEADERS.map((h) => (
                  <th key={h} className="font-medium text-start p-4 text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIAL_STOCK_HEADERS.length}>
                    <Spinner className="min-h-auto! p-12!" />
                  </td>
                </tr>
              ) : isError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIAL_STOCK_HEADERS.length}>
                    <Error
                      handleRefetchCount={handleRefetchCount}
                      text={"Unable to get material stock report"}
                      subtext={"Unable to get material stock report. Please try again."}
                    />
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIAL_STOCK_HEADERS.length}>
                    <Empty
                      text={"No stock movement yet"}
                      subtext={"No material transactions recorded for this date range."}
                    />
                  </td>
                </tr>
              ) : (
                results.map((row, i) => (
                  <tr
                    key={`${row.material}-${row.date}-${i}`}
                    className="hover:bg-bg transition-all duration-150"
                  >
                    <td className="p-4 text-nowrap text-gray-400 text-xs">
                      {formatReportDate(row.date)}
                    </td>
                    <td className="p-4">
                      <MaterialTag
                        materialName={row.material}
                        type={row.category}
                        textOnly
                      />
                    </td>
                    <td className="p-4 text-green-600 font-medium tabular-nums text-nowrap">
                      +{row.quantityIn}
                    </td>
                    <td className="p-4 text-red-600 font-medium tabular-nums text-nowrap">
                      -{row.quantityOut}
                    </td>
                    <td
                      className={`p-4 font-bold tabular-nums text-nowrap ${row.net >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {row.net >= 0 ? "+" : ""}
                      {row.net}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="flex md:hidden flex-col gap-2">
        {isLoading ? (
          <Card className="shadow-none! new-border flex-col! items-start! gap-3">
            <Spinner className="min-h-auto! p-8! w-full" />
          </Card>
        ) : isError ? (
          <Error
            handleRefetchCount={handleRefetchCount}
            text={"Unable to get material stock report"}
            subtext={"Unable to get material stock report. Please try again."}
          />
        ) : results.length === 0 ? (
          <Empty
            text={"No stock movement yet"}
            subtext={"No material transactions recorded for this date range."}
          />
        ) : (
          results.map((row, i) => (
            <Card
              key={`${row.material}-${row.date}-${i}`}
              className="shadow-none! new-border flex-col! items-start! gap-3"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <MaterialTag materialName={row.material} type={row.category} textOnly />
                <p className="text-xs text-gray-400">{formatReportDate(row.date)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">In</p>
                  <p className="text-sm font-semibold text-green-600 tabular-nums">
                    +{row.quantityIn}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Out</p>
                  <p className="text-sm font-semibold text-red-600 tabular-nums">
                    -{row.quantityOut}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Net</p>
                  <p
                    className={`text-sm font-bold tabular-nums ${row.net >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {row.net >= 0 ? "+" : ""}
                    {row.net}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};
