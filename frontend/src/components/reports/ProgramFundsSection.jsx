"use client";

import { useState } from "react";
import {
  WalletIcon,
  ArrowUpRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import { Badge } from "@/components/ui/Badge";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { HoverPortal } from "@/components/ui/HoverReveal";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { DateRangePicker, getDefaultDateRange } from "./DateRangePicker";
import { formatReportDate } from "@/lib/formatReportDate";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency } from "@/lib/formatCurrency";

const LEDGER_HEADERS = [
  "Type",
  "Name",
  "Description",
  "Program",
  "Amount",
  "Performed By",
  "Date",
];

const MaterialsBreakdown = ({ materials }) => (
  <table className="w-full text-xs border-collapse">
    <thead>
      <tr className="border-b border-gray-100">
        <th className="text-left pb-2 pr-2 font-medium text-gray-400 text-nowrap">Material</th>
        <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">Qty</th>
        <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">Price</th>
        <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">Subtotal</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {materials?.map((m, i) => (
        <tr key={i}>
          <td className="py-2 pr-4">
            <MaterialTag type={m?.category} materialName={m?.name} textOnly />
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

const NameCell = ({ row }) =>
  row.type === "income" ? (
    <HoverPortal content={<MaterialsBreakdown materials={row.materials} />}>
      <span className="underline decoration-dotted decoration-gray-300 cursor-help">
        {row.name}
      </span>
    </HoverPortal>
  ) : (
    <span>{row.name}</span>
  );

const PerformedByCell = ({ row }) => (
  <div className="flex flex-col">
    <p className="text-text-primary font-medium">{row.performedBy}</p>
    {row?.performedByRole && (
      <p className="text-xs text-gray-400 capitalize">
        {row.performedByRole.toLowerCase()}
      </p>
    )}
  </div>
);

export const ProgramFundsSection = ({ dateRange, setDateRange }) => {
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, isLoading, isError } = useFetch({
    url: `/api/reports?type=program-funds&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const rows = data?.mergedRows ?? [];
  const net = data?.net ?? 0;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Program Funds"
        subtitle="Income from junkshop sales and expenses charged to redemption programs"
        icon={<WalletIcon className="w-6 stroke-accent" />}
        noButton
      />

      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={setDateRange}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="shadow-none! new-border flex flex-col items-start">
          <div className="flex flex-row items-start justify-between w-full">
            <p className="text-xs font-medium text-text-secondary">Total Income</p>
            <IconContainer
              icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
              className="rounded-full! p-2!"
              containerColor="var(--color-icon-bg)"
            />
          </div>
          <p className="md:text-2xl font-bold text-green-600 text-lg flex flex-row items-center gap-1.5">
            {isLoading || isError ? "—" : formatCurrency(data?.totalIncome ?? 0)}
            <ArrowTrendingUpIcon className="w-5 stroke-green-600" />
          </p>
          <div className="flex flex-row items-center w-auto bg-green-50 px-3 py-1 rounded-xl text-xs gap-2">
            <BanknotesIcon className="w-3 stroke-green-700" />
            <p className="text-green-700 font-medium">From junkshop sales</p>
          </div>
        </Card>

        <Card className="shadow-none! new-border flex flex-col items-start">
          <div className="flex flex-row items-start justify-between w-full">
            <p className="text-xs font-medium text-text-secondary">Total Expense</p>
            <IconContainer
              icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
              className="rounded-full! p-2!"
              containerColor="var(--color-icon-bg)"
            />
          </div>
          <p className="md:text-2xl font-bold text-red-600 text-lg flex flex-row items-center gap-1.5">
            {isLoading || isError ? "—" : formatCurrency(data?.totalExpense ?? 0)}
            <ArrowTrendingDownIcon className="w-5 stroke-red-600" />
          </p>
          <div className="flex flex-row items-center w-auto bg-red-50 px-3 py-1 rounded-xl text-xs gap-2">
            <BanknotesIcon className="w-3 stroke-red-700" />
            <p className="text-red-700 font-medium">Program expenses</p>
          </div>
        </Card>

        <Card className="shadow-none! new-border flex flex-col items-start">
          <div className="flex flex-row items-start justify-between w-full">
            <p className="text-xs font-medium text-text-secondary">Net</p>
            <IconContainer
              icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
              className="rounded-full! p-2!"
              containerColor="var(--color-icon-bg)"
            />
          </div>
          <p
            className={`md:text-2xl font-bold text-lg flex flex-row items-center gap-1.5 ${net >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {isLoading || isError ? "—" : formatCurrency(net)}
            <ScaleIcon className={`w-5 ${net >= 0 ? "stroke-green-600" : "stroke-red-600"}`} />
          </p>
          <div
            className={`flex flex-row items-center w-auto px-3 py-1 rounded-xl text-xs gap-2 ${net >= 0 ? "bg-green-50" : "bg-red-50"}`}
          >
            <ScaleIcon className={`w-3 ${net >= 0 ? "stroke-green-700" : "stroke-red-700"}`} />
            <p className={`font-medium ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
              For this date range
            </p>
          </div>
        </Card>
      </div>

      {/* Desktop table */}
      <Card className="hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse text-gray-600">
            <thead className="border-b border-border">
              <tr>
                {LEDGER_HEADERS.map((h) => (
                  <th key={h} className="font-medium text-start p-4 text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={LEDGER_HEADERS.length}>
                    <Spinner className="min-h-auto! p-12!" />
                  </td>
                </tr>
              ) : isError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={LEDGER_HEADERS.length}>
                    <Error
                      handleRefetchCount={handleRefetchCount}
                      text={"Unable to get program funds report"}
                      subtext={"Unable to get program funds report. Please try again."}
                    />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={LEDGER_HEADERS.length}>
                    <Empty
                      text={"No transactions yet"}
                      subtext={"No income or expense records for this date range."}
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="hover:bg-bg transition-all duration-150">
                    <td className="p-4">
                      <Badge
                        label={row.type === "income" ? "Income" : "Expense"}
                        color={
                          row.type === "income"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }
                      />
                    </td>
                    <td className="p-4 font-medium text-text-primary text-nowrap">
                      <NameCell row={row} />
                    </td>
                    <td className="p-4 text-gray-500 text-nowrap">{row.description}</td>
                    <td className="p-4 text-gray-500 text-nowrap">{row.program}</td>
                    <td
                      className={`p-4 font-bold text-nowrap tabular-nums ${row.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {row.type === "income" ? "+" : "-"}
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="p-4 text-nowrap">
                      <PerformedByCell row={row} />
                    </td>
                    <td className="p-4 text-nowrap text-gray-400 text-xs">
                      {formatReportDate(row.date)}
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
            text={"Unable to get program funds report"}
            subtext={"Unable to get program funds report. Please try again."}
          />
        ) : rows.length === 0 ? (
          <Empty
            text={"No transactions yet"}
            subtext={"No income or expense records for this date range."}
          />
        ) : (
          rows.map((row, i) => (
            <Card key={i} className="shadow-none! new-border flex-col! items-start! gap-3">
              <div className="flex flex-row items-center justify-between w-full gap-2">
                <Badge
                  label={row.type === "income" ? "Income" : "Expense"}
                  color={
                    row.type === "income"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }
                />
                <p
                  className={`text-sm font-bold tabular-nums ${row.type === "income" ? "text-green-600" : "text-red-600"}`}
                >
                  {row.type === "income" ? "+" : "-"}
                  {formatCurrency(row.amount)}
                </p>
              </div>
              <div className="text-sm font-medium text-text-primary">
                <NameCell row={row} />
              </div>
              <p className="text-xs text-gray-500">{row.description}</p>
              <p className="text-xs text-gray-500">{row.program}</p>
              <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                <PerformedByCell row={row} />
                <p className="text-xs text-gray-400">{formatReportDate(row.date)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};
