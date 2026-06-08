"use client";

import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  TrophyIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowUpRightIcon,
  StarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const ALL_RESIDENTS = [
  { rank: 1, name: "Maria Santos", sitio: "Sitio 1", contribution: 45.5, points: 320 },
  { rank: 2, name: "Juan Dela Cruz", sitio: "Sitio 2", contribution: 38, points: 275 },
  { rank: 3, name: "Ana Reyes", sitio: "Sitio 1", contribution: 31.2, points: 220 },
  { rank: 4, name: "Pedro Villanueva", sitio: "Sitio 3", contribution: 27.8, points: 198 },
  { rank: 5, name: "Rosa Fernandez", sitio: "Sitio 2", contribution: 24.5, points: 175 },
  { rank: 6, name: "Carlo Bautista", sitio: "Sitio 1", contribution: 21.0, points: 152 },
  { rank: 7, name: "Liza Aquino", sitio: "Sitio 3", contribution: 18.3, points: 130 },
  { rank: 8, name: "Nestor Castillo", sitio: "Sitio 2", contribution: 15.6, points: 112 },
];

const PERIODS = ["All Time", "This Month", "This Week"];

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
  const [period, setPeriod] = useState("All Time");

  const topThree = ALL_RESIDENTS.slice(0, 3);
  const rest = ALL_RESIDENTS.slice(3);

  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Leaderboard" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Leaderboard"
          subtitle="Top residents by recyclable contributions"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Total Participants
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {ALL_RESIDENTS.length}
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <UserGroupIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Active residents</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Top Contribution
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {topThree[0].contribution} kg
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ScaleIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">
                {topThree[0].name.split(" ")[0]}
              </p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start col-span-2 lg:col-span-1">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-[#6b7280]">
                Highest Points
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                className="rounded-full! p-2!"
                containerColor="#f3f4f6"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-lg">
              {topThree[0].points} pts
            </p>
            <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
              <StarIcon className="w-3 stroke-cta-color" />
              <p className="text-cta-color font-medium">Top scorer</p>
            </div>
          </Card>
        </section>

        {/* Period Filter + Podium */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Rankings"
            subtitle="Residents ranked by total recyclable contribution"
            icon={<TrophyIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          {/* Period Filter */}
          <div className="flex flex-row gap-2 items-center flex-wrap">
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <CalendarDaysIcon className="w-4" />
              <span className="text-xs font-medium">Period:</span>
            </div>
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border ${
                  period === p
                    ? "gradient-button text-white border-transparent"
                    : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#d1d5db]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 mt-1">
            {podiumOrder.map((resident) => {
              if (!resident) return null;
              const config = MEDAL_CONFIG[resident.rank];
              return (
                <Card
                  key={resident.rank}
                  className={`shadow-none! border! ${config.border} ${config.bg} flex-col! items-center! gap-2 py-5! ${config.size} transition-transform`}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <p className="font-bold text-text-primary text-sm leading-tight">
                      {resident.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">{resident.sitio}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                    >
                      {config.label} Place
                    </span>
                    <p className="text-xs text-[#6b7280] font-medium">
                      {resident.contribution} kg
                    </p>
                    <p className={`text-xs font-semibold ${config.text}`}>
                      {resident.points} pts
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Ranks 4+ Table */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Full Rankings"
            subtitle="Rank 4 and beyond"
            icon={<UserGroupIcon className="w-6 stroke-cta-color" />}
            noButton={true}
          />

          {/* Desktop Table */}
          <Card className="hidden md:flex md:flex-col px-6 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border">
            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-[#E6EFF5]">
                <tr>
                  {["Rank", "Resident", "Sitio", "Contribution", "Points"].map((h) => (
                    <th
                      key={h}
                      className="font-medium text-sm text-[#6b7280] p-4 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rest.map((r) => (
                  <tr
                    key={r.rank}
                    className="hover:bg-[#f8f8f8] transition-all border-b border-[#f3f4f6] last:border-0"
                  >
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f3f4f6] text-xs font-bold text-[#6b7280]">
                        {r.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-text-primary">{r.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#6b7280] text-sm">{r.sitio}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-text-primary">
                        {r.contribution} kg
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-cta-color">
                        <StarIcon className="w-3 stroke-cta-color" />
                        {r.points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {rest.map((r) => (
              <Card
                key={r.rank}
                className="shadow-none! new-border flex-row! items-center! gap-3"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f4f6] text-sm font-bold text-[#6b7280] shrink-0">
                  {r.rank}
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{r.name}</p>
                  <p className="text-xs text-[#6b7280]">{r.sitio}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <p className="font-bold text-text-primary text-sm">
                    {r.contribution} kg
                  </p>
                  <span className="text-xs font-semibold text-cta-color">
                    {r.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
