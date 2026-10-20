"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { DropdownFilter } from "@/components/ui/DropdownFilter";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/lib/formatDate";
import { formatCurrency } from "@/lib/formatCurrency";

const formatMaterialAmount = (m) =>
  `${m.amount} ${m.unit === "PIECE" ? "pcs" : m.unit.toLowerCase()}`;

// "+40 pts" for what was earned, "-30 pts" for what was spent on a reward
const formatEntryPoints = (entry) => {
  const sign = entry.type === "EARNED" ? "+" : "-";
  return entry.program.isCashMode
    ? `${sign}${formatCurrency(entry.points)}`
    : `${sign}${Math.round(entry.points * 100) / 100} pts`;
};

export default function RedemptionHistoryPage() {
  const router = useRouter();
  const [refetchCount, setRefetchCount] = useState(0);
  const [programFilter, setProgramFilter] = useState("ALL");
  const { data, isLoading, isError } = useFetch({
    url: "/api/redemption/residents/me/history",
    refetchCount,
  });

  // barangays without redemption management never see this page,
  // even when the URL is typed directly
  useEffect(() => {
    if (data && !data.enabled) router.replace("/community");
  }, [data, router]);

  const entries = data?.entries ?? [];
  const filteredEntries =
    programFilter === "ALL"
      ? entries
      : entries.filter((e) => e.program.id === programFilter);

  // only programs the resident actually has history in
  const programs = [...new Map(entries.map((e) => [e.program.id, e.program])).values()];

  const filterOptions = [
    { value: "ALL", label: "All Programs", count: entries.length },
    ...programs.map((p) => ({
      value: p.id,
      label: p.name,
      count: entries.filter((e) => e.program.id === p.id).length,
    })),
  ];

  return (
    <Page className="bg-bg! overflow-hidden">
      <ResidentHeader
        title={"Redemption History"}
        className="shadow-none! bg-bg!"
      />
      <PageContent className="md:pl-3! gap-3! md:mt-16!">
        {isLoading ? (
          <Card className="flex flex-col items-start gap-2 shadow-none! new-border">
            <Skeleton width={180} />
            <Skeleton count={2} />
            <Skeleton width={120} />
          </Card>
        ) : isError ? (
          <Error
            className="pt-0!"
            subtext={"We couldn't load your history"}
            handleRefetchCount={() => setRefetchCount((prev) => prev + 1)}
          />
        ) : entries.length === 0 ? (
          <Empty
            className="pt-0!"
            text={"No history yet"}
            subtext={
              "What you bring to a redemption program and the rewards you claim will show up here"
            }
          />
        ) : (
          <>
            <DropdownFilter
              id="historyProgramFilter"
              options={filterOptions}
              value={programFilter}
              onChange={setProgramFilter}
            />

            <div className="flex flex-col gap-3">
              {filteredEntries.map((entry) => (
                <Card
                  key={`${entry.type}-${entry.id}`}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Badge
                      label={entry.type === "EARNED" ? "Brought" : "Claimed"}
                      color={
                        entry.type === "EARNED"
                          ? "bg-success/10 text-success"
                          : "bg-blue-50 text-blue-700"
                      }
                    />
                    <p className="text-xs text-gray-400">
                      {formatDate(entry.date)}
                    </p>
                  </div>

                  <div className="flex flex-row items-start justify-between w-full gap-3">
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-text-primary truncate">
                        {entry.type === "EARNED"
                          ? entry.program.name
                          : `${entry.quantity} × ${entry.reward}`}
                      </p>
                      {entry.type === "CLAIMED" && (
                        <p className="text-xs text-text-secondary">
                          {entry.program.name}
                        </p>
                      )}
                    </div>
                    <p
                      className={`font-bold tabular-nums text-nowrap ${entry.type === "EARNED" ? "text-success" : "text-text-primary"}`}
                    >
                      {formatEntryPoints(entry)}
                    </p>
                  </div>

                  {entry.type === "EARNED" && (
                    <div className="flex flex-col gap-1 w-full pt-2 border-t border-gray-100">
                      {entry.materials.map((m, i) => (
                        <div
                          key={i}
                          className="flex flex-row items-center justify-between text-sm"
                        >
                          <p className="text-gray-600">{m.name}</p>
                          <p className="text-gray-500 tabular-nums">
                            {formatMaterialAmount(m)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </PageContent>
    </Page>
  );
}
