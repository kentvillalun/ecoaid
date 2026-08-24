"use client";

import { useState } from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { DateRangePicker, getDefaultDateRange } from "./DateRangePicker";
import { formatReportDate } from "@/lib/formatReportDate";
import { useFetch } from "@/hooks/useFetch";

const COLLECTION_INTAKE_HEADERS = [
  "Resident",
  "Date",
  "Channel",
  "Materials",
  "Quantity",
];

const formatQuantity = (m) => `${m.quantity}${m.unit === "PIECE" ? "pcs" : m.unit}`;

// Desktop table: materials and their quantities are two separate columns, so
// each list renders one line per material with matching spacing to stay aligned.
const MaterialTagsList = ({ materials }) => (
  <div className="flex flex-col gap-1.5">
    {materials?.map((m, idx) => (
      <div key={idx} className="h-5.5 flex items-center">
        <MaterialTag materialName={m.name} type={m.category} textOnly />
      </div>
    ))}
  </div>
);

const QuantityList = ({ materials }) => (
  <div className="flex flex-col gap-1.5">
    {materials?.map((m, idx) => (
      <div key={idx} className="h-5.5 flex items-center text-xs text-gray-500 tabular-nums lowercase">
        {formatQuantity(m)}
      </div>
    ))}
  </div>
);

// Mobile card: no separate columns, so tag + quantity sit together per line.
const MaterialsList = ({ materials }) => (
  <div className="flex flex-col gap-1.5">
    {materials?.map((m, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <MaterialTag materialName={m.name} type={m.category} textOnly />
        <span className="text-xs text-gray-500 tabular-nums lowercase">
          {formatQuantity(m)}
        </span>
      </div>
    ))}
  </div>
);

export const CollectionIntakeSection = ({dateRange, setDateRange}) => {
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, isLoading, isError } = useFetch({
    url: `/api/reports?type=collection-intake&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const records = data?.mergedRecords ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Collection & Intake"
        subtitle="Materials collected through pickup requests and manual intake"
        icon={<ArrowsRightLeftIcon className="w-6 stroke-accent" />}
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
                {COLLECTION_INTAKE_HEADERS.map((h) => (
                  <th key={h} className="font-medium text-start p-4 text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={COLLECTION_INTAKE_HEADERS.length}>
                    <Spinner className="min-h-auto! p-12!" />
                  </td>
                </tr>
              ) : isError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={COLLECTION_INTAKE_HEADERS.length}>
                    <Error
                      handleRefetchCount={handleRefetchCount}
                      text={"Unable to get collection & intake report"}
                      subtext={"Unable to get collection & intake report. Please try again."}
                    />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={COLLECTION_INTAKE_HEADERS.length}>
                    <Empty
                      text={"No collections yet"}
                      subtext={"No collection or intake records for this date range."}
                    />
                  </td>
                </tr>
              ) : (
                records.map((row, i) => (
                  <tr key={i} className="hover:bg-bg transition-all duration-150">
                    <td className="p-4 font-medium text-text-primary text-nowrap">
                      {row.residentName}
                    </td>
                    <td className="p-4 text-nowrap text-gray-400 text-xs">
                      {formatReportDate(row.date)}
                    </td>
                    <td className="p-4 text-gray-600 text-nowrap">
                      {row.channel}
                    </td>
                    <td className="p-4">
                      <MaterialTagsList materials={row.materials} />
                    </td>
                    <td className="p-4">
                      <QuantityList materials={row.materials} />
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
            text={"Unable to get collection & intake report"}
            subtext={"Unable to get collection & intake report. Please try again."}
          />
        ) : records.length === 0 ? (
          <Empty
            text={"No collections yet"}
            subtext={"No collection or intake records for this date range."}
          />
        ) : (
          records.map((row, i) => (
            <Card
              key={i}
              className="shadow-none! new-border flex-col! items-start! gap-3"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <p className="text-sm font-semibold text-text-primary">
                  {row.residentName}
                </p>
                <p className="text-xs text-gray-500">{row.channel}</p>
              </div>
              <MaterialsList materials={row.materials} />
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 w-full">
                {formatReportDate(row.date)}
              </p>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};
