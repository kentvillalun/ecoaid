"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TYPES = ["By Kilogram", "By Piece"];
const PERIODS = [
  { key: "all", label: "All Time" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

const MEDAL_CONFIG = {
  1: {
    label: "1st",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    emoji: "🥇",
  },
  2: {
    label: "2nd",
    bg: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-600",
    emoji: "🥈",
  },
  3: {
    label: "3rd",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    emoji: "🥉",
  },
};

export default function StandingsPage() {
  const [type, setType] = useState("By Kilogram");
  const [period, setPeriod] = useState("all");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);

  const { data: userData } = useFetch({ url: "/api/resident/me" });

  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: `/api/leaderboard/residents?timeFrame=${period}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  useEffect(() => {
    const handler = (e) => {
      if (!periodDropdownRef?.current?.contains(e.target))
        setShowPeriodDropdown(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unitLabel = type === "By Kilogram" ? "kg" : "pcs";
  const leaderboard =
    type === "By Kilogram" ? data?.weightLeaderboard : data?.pieceLeaderboard;

  const currentUserId = data?.currentUserId;
  const topThree = leaderboard?.slice(0, 3);
  const rest = leaderboard?.slice(3);

  return (
    <Page className="bg-bg!">
      <ResidentHeader title={"Standings"} className="shadow-none! bg-bg!" />
      <PageContent className="md:pl-3! gap-3!">
        {/* Helper message */}
        <Card className="shadow-none! new-border flex-row! items-center! gap-3">
          <IconContainer
            icon={<TrophyIcon className="w-5 stroke-accent" />}
            className="rounded-full! p-2.5! shrink-0"
            containerColor="var(--color-icon-bg)"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-text-primary">
              Climb the standings
            </p>
            <p className="text-xs text-text-secondary">
              Submit a pickup request and get your recyclables collected to
              earn your spot on the leaderboard.
            </p>
          </div>
        </Card>

        {!userData?.user?.isVerified ? (
          <div className="flex flex-col items-center text-center py-6 gap-1">
            <p className="text-sm text-dark font-medium">
              Standings are locked
            </p>
            <p className="text-xs text-text-primary">
              Complete your first pickup to appear on the standings
            </p>
          </div>
        ) : (
          <>
            {/* Type + Period Filters */}
            <div className="flex flex-row gap-2 items-center justify-between flex-wrap">
              {/* Type Filter */}
              <div className="flex flex-row gap-2 items-center flex-wrap">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border hover:cursor-pointer ${
                      type === t
                        ? "gradient-button text-white border-transparent"
                        : "bg-surface text-text-secondary border-border"
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
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 hover:cursor-pointer border ${
                      period === p.key
                        ? "gradient-button text-white border-transparent"
                        : "bg-surface text-text-secondary border-border"
                    }`}
                  >
                    {p.label}
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
                  {PERIODS.find((p) => p.key === period)?.label}
                  <ChevronDownIcon className="w-3.5" />
                </button>
                {showPeriodDropdown && (
                  <div className="absolute right-0 top-9 z-40 flex flex-col items-start w-36 bg-surface rounded-lg new-border text-xs py-2">
                    {PERIODS.map((p) => (
                      <div
                        key={p.key}
                        onClick={() => {
                          setPeriod(p.key);
                          setShowPeriodDropdown(false);
                        }}
                        className={`px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
                          period === p.key
                            ? "text-accent font-semibold"
                            : "text-text-secondary"
                        }`}
                      >
                        {p.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top 3 podium */}
            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="shadow-none! new-border flex-col! items-center! gap-2 py-6! px-3!"
                  >
                    <Skeleton circle width={24} height={24} />
                    <Skeleton width={60} />
                    <Skeleton width={40} />
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <Card className="shadow-none! new-border">
                <Error handleRefetchCount={handleRefetchCount} />
              </Card>
            ) : !topThree || topThree.length === 0 ? (
              <Empty
                text="No rankings yet"
                subtext="No residents have logged contributions yet."
              />
            ) : (
              <div
                className={`grid gap-3 ${
                  topThree.length === 1
                    ? "grid-cols-1"
                    : topThree.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {[topThree[1], topThree[0], topThree[2]]
                  .filter(Boolean)
                  .map((resident) => {
                    const config = MEDAL_CONFIG[resident.rank];
                    const isCurrentUser = resident.userId === currentUserId;
                    return (
                      <Card
                        key={resident.rank}
                        className={`shadow-none! border! ${config.border} ${config.bg} flex-col! items-center! gap-1.5 py-5! px-2! ${
                          isCurrentUser ? "ring-2 ring-accent" : ""
                        }`}
                      >
                        <span className="text-xl">{config.emoji}</span>
                        <div className="flex flex-col items-center gap-0.5 text-center">
                          <p className="font-bold text-text-primary text-xs leading-tight truncate max-w-full">
                            {isCurrentUser ? "You" : resident.name}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {resident.purok}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                        >
                          {(resident.total).toFixed(4)} {unitLabel}
                        </span>
                      </Card>
                    );
                  })}
              </div>
            )}

            {/* Rank 4+ list */}
            {!isLoading && !isError && rest && rest.length > 0 && (
              <div className="flex flex-col gap-2">
                {rest.map((r) => {
                  const isCurrentUser = r.userId === currentUserId;
                  return (
                    <Card
                      key={r.rank}
                      className={`shadow-none! new-border flex-row! items-center! gap-3 ${
                        isCurrentUser ? "ring-2 ring-accent" : ""
                      }`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-icon-bg text-sm font-bold text-text-secondary shrink-0">
                        {r.rank}
                      </span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">
                          {isCurrentUser ? "You" : r.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {r.purok}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <p className="font-bold text-text-primary text-sm">
                          {r.total} {unitLabel}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </PageContent>
    </Page>
  );
}
