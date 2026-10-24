"use client";

import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { ChevronRightIcon, GiftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { formatProgramPoints } from "@/components/redemption/ResidentPointsPicker";
import { formatMaterialRate } from "@/lib/formatMaterialRate";

// max programs shown on the community page; the rest are on /programs
const COMMUNITY_LIMIT = 2;

// a reward shows "Only N left" at or below this stock
const LOW_STOCK_LIMIT = 5;

// Only rendered by the parent when the barangay has redemption management
// enabled, so a disabled barangay never fetches or shows anything here.
export const ResidentProgramsSection = ({ isVerified }) => (
  <div className="flex flex-col gap-3">
    <div className="text-base flex flex-row justify-between">
      <p className="font-semibold">Redemption Programs</p>
      <Link className="flex flex-row text-sm items-center" href={"/programs"}>
        <p className="font-medium text-accent">View more</p>{" "}
        <ChevronRightIcon className="w-3" />{" "}
      </Link>
    </div>
    <ResidentProgramsList isVerified={isVerified} limit={COMMUNITY_LIMIT} />
  </div>
);

// Locked the same way as announcements: unverified residents (no completed
// pickup yet) see a lock message and the programs are never fetched.
export const ResidentProgramsList = ({ isVerified, limit }) => {
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: isVerified ? "/api/redemption/programs/residents" : null,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-1">
        <p className="text-sm text-dark font-medium">
          Redemption programs are locked
        </p>
        <p className="text-xs text-text-primary">
          Complete your first pickup to view redemption programs
        </p>
      </div>
    );
  }

  // guard in case the flag changed between barangay-info and this fetch
  if (data && !data.enabled) return null;

  const programs = limit ? data?.programs?.slice(0, limit) : data?.programs;

  return (
    <>
      {isLoading ? (
        <Card className="flex flex-col items-start gap-2 shadow-none! new-border">
          <Skeleton width={180} />
          <Skeleton count={2} />
          <Skeleton width={120} />
        </Card>
      ) : isError ? (
        <Error
          className="pt-0!"
          subtext={"We couldn't load the redemption programs"}
          handleRefetchCount={handleRefetchCount}
        />
      ) : programs?.length === 0 ? (
        <Empty
          className="pt-0!"
          textClassName="text-sm! font-medium! text-dark!"
          subtextClassName="text-xs! text-black!"
          text={"No active programs"}
          subtext={"There are no redemption programs running at the moment"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {programs?.map((program) => (
            <Card
              key={program.id}
              className="flex flex-col items-start gap-3 shadow-none! new-border"
            >
              {/* no mode label: the balance and the material values
                  ("pts" vs "₱") already show if it's a points or cash program */}
              <div className="flex flex-row items-center justify-between w-full gap-3">
                <div className="flex flex-row gap-3 items-center min-w-0">
                  <GiftIcon className="w-6 stroke-accent shrink-0" />
                  <p className="font-bold text-text-primary">{program.name}</p>
                </div>

                {/* the resident's own balance in this program */}
                <p className="shrink-0 bg-accent/10 text-accent text-sm font-bold tabular-nums px-3 py-1 rounded-full">
                  {formatProgramPoints({
                    isCashMode: program.isCashMode,
                    points: program.myPoints ?? 0,
                  })}
                </p>
              </div>

              {program.description && (
                <p className="text-sm text-gray-600">{program.description}</p>
              )}

              {program.programMaterial?.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-xs font-semibold text-accent">
                    Accepted materials
                  </p>
                  {/* same chips as the staff program card, all shown */}
                  <div className="flex flex-row flex-wrap gap-1">
                    {program.programMaterial.map((pm) => (
                      <MaterialTag
                        key={pm.id}
                        materialName={pm.material?.name}
                        type={pm.material?.category?.name}
                        points={formatMaterialRate(pm, program.isCashMode)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!program.isCashMode && program.rewardItems?.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-accent">
                      Available rewards
                    </p>
                    <p className="text-xs text-text-secondary">
                      You can claim{" "}
                      {
                        program.rewardItems.filter(
                          (r) =>
                            r.available > 0 &&
                            r.pointCost <= (program.myPoints ?? 0),
                        ).length
                      }{" "}
                      of {program.rewardItems.length}
                    </p>
                  </div>
                  {/* cheapest first; rewards within the resident's points look
                      normal, the rest are muted with the points still missing */}
                  <div className="flex flex-col gap-1.5">
                    {[...program.rewardItems]
                      .sort((a, b) => a.pointCost - b.pointCost)
                      .map((reward) => {
                        const missingPoints =
                          Math.round(
                            (reward.pointCost - (program.myPoints ?? 0)) * 100,
                          ) / 100;
                        const isOutOfStock = reward.available <= 0;
                        const canClaim = missingPoints <= 0 && !isOutOfStock;

                        return (
                          <div
                            key={reward.id}
                            className="flex flex-row items-center justify-between gap-2"
                          >
                            <p className="text-sm truncate min-w-0">
                              <span
                                className={
                                  canClaim
                                    ? "text-text-primary font-medium"
                                    : "text-text-secondary"
                                }
                              >
                                {reward.name}
                              </span>
                              {reward.available <= LOW_STOCK_LIMIT && (
                                <span className="text-xs text-orange-600 ml-1.5">
                                  {isOutOfStock
                                    ? "0 left"
                                    : `Only ${reward.available} left`}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-nowrap tabular-nums">
                              {missingPoints > 0 && (
                                <span className="text-text-secondary">
                                  {missingPoints} more ·{" "}
                                </span>
                              )}
                              <span
                                className={
                                  canClaim
                                    ? "font-semibold text-accent"
                                    : "text-text-secondary"
                                }
                              >
                                {reward.pointCost} pts
                              </span>
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
