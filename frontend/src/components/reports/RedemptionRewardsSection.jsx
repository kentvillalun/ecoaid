"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  GiftIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { DateRangePicker, getDefaultDateRange } from "./DateRangePicker";
import { formatReportDate } from "@/lib/formatReportDate";
import { formatCurrency } from "@/lib/formatCurrency";
import { useFetch } from "@/hooks/useFetch";

const REDEMPTION_HEADERS = [
  "Beneficiary",
  "Educational Level",
  "Date Submitted",
  "Materials Collected",
  "Quantity",
  "Earned",
  "Reward Received",
  "Date Released",
  "Spent",
];

// A report can span multiple programs at once, mixing points-mode and
// cash-mode rows in the same table, so each row formats itself off its own
// isCashMode flag rather than the table using one fixed unit for everything.
const formatEarnedSpent = (value, isCashMode) =>
  isCashMode ? formatCurrency(value) : `${value} pts`;

// Matches the Collection & Intake section's quantity formatting convention
const formatMaterialAmount = (m) => `${m.amount}${m.unit === "PIECE" ? "pcs" : m.unit}`;

// Desktop table: materials and their quantities are two separate columns, so
// each list renders one line per material with matching spacing to stay aligned.
const MaterialsCollectedList = ({ materials }) => (
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
      <div
        key={idx}
        className="h-5.5 flex items-center text-xs text-gray-500 tabular-nums lowercase"
      >
        {formatMaterialAmount(m)}
      </div>
    ))}
  </div>
);

// Mobile card: material name on the left, quantity on the right, per line.
const MobileMaterialsList = ({ materials }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {materials?.map((m, idx) => (
      <div key={idx} className="flex items-center justify-between gap-2">
        <MaterialTag materialName={m.name} type={m.category} textOnly />
        <span className="text-xs text-gray-500 tabular-nums lowercase">
          {formatMaterialAmount(m)}
        </span>
      </div>
    ))}
  </div>
);

// Dash for an unreleased cash-mode row, "Not yet released" for points-mode
// (unchanged prior behavior) — shared by both the reward and date columns
// so a beneficiary with zero releases shows the same empty state in each.
const emptyReleaseLabel = (isCashMode) =>
  isCashMode ? (
    <span className="text-gray-400">-</span>
  ) : (
    <span className="text-gray-400 italic">Not yet released</span>
  );

// "Reward Received" and "Date Released" are two separate columns built from
// the same rewardReceived array, so each renders one line per release at the
// same row height — line N of one always lines up with line N of the other.
const RewardReceivedList = ({ rewardReceived, isCashMode }) =>
  rewardReceived.length > 0 ? (
    <div className="flex flex-col gap-1.5">
      {rewardReceived.map((r, idx) => (
        <div key={idx} className="h-5.5 flex items-center">
          {r.quantity}× {r.name}
        </div>
      ))}
    </div>
  ) : (
    emptyReleaseLabel(isCashMode)
  );

const DateReleasedList = ({ rewardReceived, isCashMode }) =>
  rewardReceived.length > 0 ? (
    <div className="flex flex-col gap-1.5">
      {rewardReceived.map((r, idx) => (
        <div key={idx} className="h-5.5 flex items-center">
          {formatReportDate(r.date)}
        </div>
      ))}
    </div>
  ) : (
    emptyReleaseLabel(isCashMode)
  );

// Same select/dropdown pattern as DateRangePicker's date filter — a button
// showing the current selection that toggles an absolute-positioned list.
// Reuses GET /redemption/programs (already fetched elsewhere, e.g.
// ReleaseRewardModal) rather than a new endpoint.
const ProgramFilter = ({ value, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { data } = useFetch({ url: "/api/redemption/programs" });
  const programs = (data?.programs ?? []).filter((p) => p.isActive);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef?.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = programs.find((p) => p.id === value)?.name ?? "All Programs";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border hover:cursor-pointer"
      >
        <RectangleStackIcon className="w-4" />
        {selectedLabel}
        <ChevronDownIcon className="w-3.5" />
      </button>
      {showDropdown && (
        <div className="absolute right-0 top-9 z-40 flex flex-col items-start w-40 bg-surface rounded-lg new-border text-xs py-2">
          <div
            onClick={() => {
              onChange("");
              setShowDropdown(false);
            }}
            className={`px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
              !value ? "text-accent font-semibold" : "text-text-secondary"
            }`}
          >
            All Programs
          </div>
          {programs.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onChange(p.id);
                setShowDropdown(false);
              }}
              className={`px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
                value === p.id ? "text-accent font-semibold" : "text-text-secondary"
              }`}
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RedemptionRewardsSection = ({ dateRange, setDateRange, programId, setProgramId}) => {
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, isLoading, isError } = useFetch({
    url: `/api/reports?type=redemption&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}${programId ? `&programId=${programId}` : ""}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const records = data?.merged ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Redemption & Rewards"
        subtitle="Beneficiary redemptions and the rewards released for them"
        icon={<GiftIcon className="w-6 stroke-accent" />}
        noButton
      />

      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
        <ProgramFilter value={programId} onChange={setProgramId} />
      </div>

      {/* Desktop table */}
      <Card className="hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse text-gray-600">
            <thead className="border-b border-border">
              <tr>
                {REDEMPTION_HEADERS.map((h) => (
                  <th key={h} className="font-medium text-start p-4 text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={REDEMPTION_HEADERS.length}>
                    <Spinner className="min-h-auto! p-12!" />
                  </td>
                </tr>
              ) : isError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={REDEMPTION_HEADERS.length}>
                    <Error
                      handleRefetchCount={handleRefetchCount}
                      text={"Unable to get redemption & rewards report"}
                      subtext={"Unable to get redemption & rewards report. Please try again."}
                    />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={REDEMPTION_HEADERS.length}>
                    <Empty
                      text={"No redemptions yet"}
                      subtext={"No redemption records for this date range."}
                    />
                  </td>
                </tr>
              ) : (
                records.map((row, i) => (
                  <tr key={i} className="hover:bg-bg transition-all duration-150">
                    <td className="p-4 font-medium text-text-primary text-nowrap">
                      {row.beneficiaryName}
                    </td>
                    <td className="p-4 text-nowrap text-gray-500 capitalize">
                      {row.educationalLevel
                        ? `${row.educationalLevel.toLowerCase()} level`
                        : "-"}
                    </td>
                    <td className="p-4 text-nowrap text-gray-400 text-xs">
                      {formatReportDate(row.dateSubmitted)}
                    </td>
                    <td className="p-4">
                      <MaterialsCollectedList materials={row.materialsCollected} />
                    </td>
                    <td className="p-4">
                      <QuantityList materials={row.materialsCollected} />
                    </td>
                    <td className="p-4 font-medium text-text-primary tabular-nums text-nowrap">
                      {formatEarnedSpent(row.pointsEarned, row.isCashMode)}
                    </td>
                    <td className="p-4 text-nowrap">
                      <RewardReceivedList
                        rewardReceived={row.rewardReceived}
                        isCashMode={row.isCashMode}
                      />
                    </td>
                    <td className="p-4 text-nowrap text-xs">
                      <DateReleasedList
                        rewardReceived={row.rewardReceived}
                        isCashMode={row.isCashMode}
                      />
                    </td>
                    <td className="p-4 tabular-nums text-nowrap">
                      {row.rewardReceived.length === 0 && row.isCashMode
                        ? "-"
                        : formatEarnedSpent(row.pointsSpent, row.isCashMode)}
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
            text={"Unable to get redemption & rewards report"}
            subtext={"Unable to get redemption & rewards report. Please try again."}
          />
        ) : records.length === 0 ? (
          <Empty
            text={"No redemptions yet"}
            subtext={"No redemption records for this date range."}
          />
        ) : (
          records.map((row, i) => (
            <Card
              key={i}
              className="shadow-none! new-border flex-col! items-start! gap-3"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-text-primary">
                    {row.beneficiaryName}
                  </p>
                  {row.educationalLevel && (
                    <p className="text-xs text-gray-400 capitalize">
                      {row.educationalLevel.toLowerCase()} level
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {formatReportDate(row.dateSubmitted)}
                </p>
              </div>

              <MobileMaterialsList materials={row.materialsCollected} />

              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Earned</p>
                  <p className="text-sm font-semibold text-text-primary tabular-nums">
                    {formatEarnedSpent(row.pointsEarned, row.isCashMode)}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Spent</p>
                  <p className="text-sm font-semibold text-text-primary tabular-nums">
                    {row.rewardReceived.length === 0 && row.isCashMode
                      ? "-"
                      : formatEarnedSpent(row.pointsSpent, row.isCashMode)}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Reward Received</p>
                  <div className="text-sm text-text-primary">
                    <RewardReceivedList
                      rewardReceived={row.rewardReceived}
                      isCashMode={row.isCashMode}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400">Date Released</p>
                  <div className="text-sm text-text-primary">
                    <DateReleasedList
                      rewardReceived={row.rewardReceived}
                      isCashMode={row.isCashMode}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};
