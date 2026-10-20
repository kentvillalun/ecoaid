"use client";

import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { ChevronRightIcon, GiftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { formatProgramPoints } from "@/components/redemption/ResidentPointsPicker";

const REWARD_CATEGORY_COLORS = {
  MEDICINE: "bg-red-50 text-red-700",
  GOODS: "bg-blue-50 text-blue-700",
  SCHOOL_SUPPLIES: "bg-yellow-50 text-yellow-700",
  SERVICES: "bg-purple-50 text-purple-700",
  OTHERS: "bg-gray-100 text-gray-600",
};

const REWARD_CATEGORY_LABELS = {
  MEDICINE: "Medicine",
  GOODS: "Goods",
  SCHOOL_SUPPLIES: "School Supplies",
  SERVICES: "Services",
  OTHERS: "Others",
};

const formatValue = (programMaterial, isCashMode) => {
  const unit = programMaterial.material?.defaultUnit?.toLowerCase();
  return isCashMode
    ? `₱${programMaterial.cashValue ?? 0}/${unit}`
    : `${programMaterial.pointValue ?? 0} pts/${unit}`;
};

// max programs shown on the community page; the rest are on /programs
const COMMUNITY_LIMIT = 2;

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
              <div className="flex flex-row items-start justify-between w-full gap-2">
                <div className="flex flex-row gap-3 items-center">
                  <GiftIcon className="w-6 stroke-accent shrink-0" />
                  <p className="font-bold text-text-primary">{program.name}</p>
                </div>
                <Badge
                  label={program.isCashMode ? "Cash" : "Points"}
                  color={
                    program.isCashMode
                      ? "bg-success/10 text-success"
                      : "bg-blue-50 text-blue-700"
                  }
                />
              </div>

              {/* the resident's own balance in this program */}
              <div className="flex flex-row items-center justify-between w-full bg-accent/10 px-3 py-2 rounded-xl">
                <p className="text-xs font-medium text-text-secondary">
                  {program.isCashMode ? "You've earned" : "Your points"}
                </p>
                <p className="text-sm font-bold text-accent tabular-nums">
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
                  <div className="flex flex-col gap-1.5">
                    {program.programMaterial.map((pm) => (
                      <div
                        key={pm.id}
                        className="flex flex-row items-center justify-between gap-2"
                      >
                        <MaterialTag
                          materialName={pm.material?.name}
                          type={pm.material?.category?.name}
                        />
                        <p className="text-xs font-medium text-text-primary text-nowrap">
                          {formatValue(pm, program.isCashMode)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!program.isCashMode && program.rewardItems?.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-xs font-semibold text-accent">
                    Available rewards
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {program.rewardItems.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex flex-row items-center justify-between gap-2"
                      >
                        <div className="flex flex-row items-center gap-2 min-w-0">
                          <Badge
                            label={REWARD_CATEGORY_LABELS[reward.category]}
                            color={REWARD_CATEGORY_COLORS[reward.category]}
                          />
                          <p className="text-sm text-text-primary truncate">
                            {reward.name}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-text-primary text-nowrap">
                          {reward.pointCost} pts
                        </p>
                      </div>
                    ))}
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
