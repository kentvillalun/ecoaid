"use client";

import { useEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import {
  TrophyIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TYPES = ["By Kilogram", "By Piece"];
const PERIODS = ["All Time", "This Month", "This Week"];

const TABLE_HEADERS = ["Rank", "Resident", "Sitio", "Contribution"];

const MEDAL_CONFIG = {
  1: {
    label: "1st",
    bg: "bg-amber-50",
    border: "border-amber-300",
    medal: "bg-amber-400",
    text: "text-amber-700",
    size: "md:scale-105",
    emoji: "🥇",
  },
  2: {
    label: "2nd",
    bg: "bg-slate-50",
    border: "border-slate-300",
    medal: "bg-slate-400",
    text: "text-slate-600",
    size: "",
    emoji: "🥈",
  },
  3: {
    label: "3rd",
    bg: "bg-orange-50",
    border: "border-orange-300",
    medal: "bg-orange-400",
    text: "text-orange-700",
    size: "",
    emoji: "🥉",
  },
};

export default function LeaderboardPage() {
  const [type, setType] = useState("By Kilogram");
  const [period, setPeriod] = useState("All Time");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);

  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/leaderboard",
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const unitLabel = type === "By Kilogram" ? "kg" : "pcs";
  const leaderboard =
    type === "By Kilogram" ? data?.weightLeaderboard : data?.pieceLeaderboard;

  const topThree = leaderboard?.slice(0, 3);
  const rest = leaderboard?.slice(3);

  const podiumOrder = topThree ? [topThree[1], topThree[0], topThree[2]] : [];

  useEffect(() => {
    const handler = (e) => {
      if (!periodDropdownRef?.current?.contains(e.target))
        setShowPeriodDropdown(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Leaderboard" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Leaderboard"
          subtitle="Top residents by recyclable contributions"
        />

        {/* Summary Cards */}
        <section className="grid grid-rows-2 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Participants
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            {isLoading ? (
              <Skeleton width={40} />
            ) : isError ? (
              <p className="font-bold text-text-primary text-sm">
                Data not available
              </p>
            ) : (
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                {leaderboard?.length ?? 0}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <UserGroupIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Active residents</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Top Contribution
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            {isLoading ? (
              <Skeleton width={40} />
            ) : isError ? (
              <p className="font-bold text-text-primary text-sm">
                Data not available
              </p>
            ) : (
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                {topThree?.[0] ? `${topThree[0].total} ${unitLabel}` : "—"}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ScaleIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">
                {isLoading || isError
                  ? "—"
                  : (topThree?.[0]?.name?.split(" ")[0] ?? "—")}
              </p>
            </div>
          </Card>
        </section>

        {/* Period Filter + Podium */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Rankings"
            subtitle="Residents ranked by total recyclable contribution"
            icon={<TrophyIcon className="w-6 stroke-accent" />}
            noButton={true}
          />

          {/* Type + Period Filters */}
          <div className="flex flex-row gap-2 items-center justify-between flex-wrap">
            {/* Type Filter */}
            <div className="flex flex-row gap-2 items-center flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border ${
                    type === t
                      ? "gradient-button text-white border-transparent"
                      : "bg-surface text-text-secondary border-border hover:border-[#d1d5db]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Period Filter — desktop pills */}
            <div className="hidden md:flex flex-row gap-2 items-center flex-wrap">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <CalendarDaysIcon className="w-4" />
              </div>
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border ${
                    period === p
                      ? "gradient-button text-white border-transparent"
                      : "bg-surface text-text-secondary border-border hover:border-[#d1d5db]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Period Filter — mobile dropdown */}
            <div className="relative md:hidden" ref={periodDropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border"
              >
                <CalendarDaysIcon className="w-4" />
                {period}
                <ChevronDownIcon className="w-3.5" />
              </button>
              {showPeriodDropdown && (
                <div className="absolute right-0 top-9 z-40 flex flex-col items-start w-36 bg-surface rounded-lg new-border text-xs py-2">
                  {PERIODS.map((p) => (
                    <div
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        setShowPeriodDropdown(false);
                      }}
                      className={`px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
                        period === p
                          ? "text-accent font-semibold"
                          : "text-text-secondary"
                      }`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Podium */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="shadow-none! new-border flex-col! items-center! gap-2 py-6! px-3!"
                >
                  <Skeleton circle width={28} height={28} />
                  <Skeleton width={80} />
                  <Skeleton width={50} />
                  <Skeleton width={60} />
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="shadow-none! new-border">
              <Error handleRefetchCount={handleRefetchCount} />
            </Card>
          ) : !topThree || topThree.length === 0 ? (
            <Card className="shadow-none! new-border">
              <Empty
                text="No rankings yet"
                subtext="No residents have logged contributions for this filter yet."
              />
            </Card>
          ) : (
            <div
              className={`grid gap-4 md:gap-6 mt-1 ${
                topThree.length === 1
                  ? "grid-cols-1"
                  : topThree.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {podiumOrder.filter(Boolean).map((resident) => {
                const config = MEDAL_CONFIG[resident.rank];
                return (
                  <Card
                    key={resident.rank}
                    className={`shadow-none! border! ${config.border} ${config.bg} flex-col! items-center! gap-2 py-6! px-3! ${
                      topThree.length === 1 ? "" : config.size
                    } transition-transform`}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <p className="font-bold text-text-primary text-sm leading-tight">
                        {resident.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {resident.purok}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                      >
                        {config.label} Place
                      </span>
                      <p className="text-xs text-text-secondary font-medium">
                        {resident.total} {unitLabel}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Ranks 4+ Table */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Full Rankings"
            subtitle="Rank 4 and beyond"
            icon={<UserGroupIcon className="w-6 stroke-accent" />}
            noButton={true}
          />

          {/* Desktop Table */}
          <Card className={`${inter.className} hidden md:flex md:flex-col px-6 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}>
            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-border">
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="font-medium text-sm text-text-secondary p-4 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length}>
                      <Spinner />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length}>
                      <Error handleRefetchCount={handleRefetchCount} />
                    </td>
                  </tr>
                ) : !rest || rest.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length}>
                      <Empty
                        text="No more rankings"
                        subtext="There are no residents beyond the top 3 yet."
                      />
                    </td>
                  </tr>
                ) : (
                  rest.map((r) => (
                    <tr
                      key={r.rank}
                      className="hover:bg-bg transition-all border-b border-icon-bg last:border-0"
                    >
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-icon-bg text-xs font-bold text-text-secondary">
                          {r.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">
                          {r.name}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-text-secondary text-sm">{r.purok}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-text-primary">
                          {r.total} {unitLabel}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="shadow-none! new-border flex-row! items-center! gap-3"
                >
                  <Skeleton circle width={32} height={32} />
                  <div className="flex flex-col flex-1 gap-1">
                    <Skeleton width={120} />
                    <Skeleton width={80} />
                  </div>
                  <Skeleton width={50} />
                </Card>
              ))
            ) : isError ? (
              <Error handleRefetchCount={handleRefetchCount} />
            ) : !rest || rest.length === 0 ? (
              <Empty
                text="No more rankings"
                subtext="There are no residents beyond the top 3 yet."
              />
            ) : (
              rest.map((r) => (
                <Card
                  key={r.rank}
                  className="shadow-none! new-border flex-row! items-center! gap-3"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-icon-bg text-sm font-bold text-text-secondary shrink-0">
                    {r.rank}
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-text-secondary">{r.purok}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <p className="font-bold text-text-primary text-sm">
                      {r.total} {unitLabel}
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
