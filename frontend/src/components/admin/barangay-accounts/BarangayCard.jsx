"use client";

import { PhoneIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

// Date-only variant of the app's formatDate() convention (same locale/parts,
// minus hour/minute) — a registration date doesn't need a time-of-day.
const formatDateOnly = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Hardcoded, literal colors — Super Admin is platform-level and is never
// themed per-barangay, so nothing here reads from the theme system.
const MODULE_STATE_STYLES = {
  on: { bg: "#eaf7e3", text: "#14532D" },
  off: { bg: "#f3f4f6", text: "#9ca3af" },
};

const MODULE_LABELS = [
  { key: "hasCollectionRequests", label: "Collection Requests" },
  { key: "hasRedemptionManagement", label: "Redemption Management" },
  { key: "hasRewardInventory", label: "Reward Inventory" },
  { key: "hasLeaderboard", label: "Leaderboard" },
];

const ModuleTag = ({ label, enabled }) => {
  const style = enabled ? MODULE_STATE_STYLES.on : MODULE_STATE_STYLES.off;
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full text-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
};

export const BarangayCard = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter()
  return (
    <div className="flex md:hidden flex-col gap-2">
      {isLoading ? (
        Array.from({ length: 1 }).map((_, index) => (
          <Card
            key={index}
            
            className="flex flex-col items-start gap-3 shadow-none! rounded-xl! transition-all new-border hover:cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] duration-200 ease-in-out"
          >
            <div className="flex flex-col items-start justify-between gap-2 w-full">
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-col">
                  <Skeleton width={200} />
                  <Skeleton width={150} />
                </div>
              </div>

              <div className="flex flex-row items-center justify-between w-full gap-1 shrink-0">
                <Skeleton width={110} />
                <Skeleton width={150} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Modules
              </p>
              <div className="flex flex-wrap gap-1.5 w-full">
                {Array.from({ length: 1 }).map((_, i) => (
                  <Skeleton width={140} key={i} />
                ))}
              </div>
            </div>
          </Card>
        ))
      ) : isError ? (
        <Error handleRefetchCount={handleRefetchCount} text={"Something went wrong"} subtext={"Unable to load registered barangays. Please try again."}/>
      ) : data?.length === 0 ? (
        <Empty
          text={"No barangays yet"}
          subtext={"There are no registered barangays on the platform yet."}
        />
      ) : (
        data?.map((b) => (
          <Card
            key={b.id}
            handleClick={() => router.push(`/barangay-accounts/${b.id}`)}
            className="flex flex-col items-start gap-3 shadow-none! rounded-xl! transition-all new-border hover:cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] duration-200 ease-in-out"
          >
            <div className="flex flex-col items-start justify-between gap-2 w-full">
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-text-primary">
                    Barangay {b.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {b.municipality}, {b.province}
                  </p>
                </div>
                {/* <button
                  type="button"
                  aria-label={`Call ${b.name}`}
                  className="rounded-full p-2 hover:cursor-pointer transition-colors new-border"

                >
                  <PhoneIcon
                    className="w-4 h-4 stroke-admin-accent"

                  />
                </button> */}
              </div>

              <div className="flex flex-row items-center justify-between w-full gap-1 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                  {b.contactNumber}
                </div>
                <p className="text-xs text-gray-400 text-nowrap">
                  Registered {formatDateOnly(b.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Modules
              </p>
              <div className="flex flex-wrap gap-1.5 w-full">
                {MODULE_LABELS.map((module) => (
                  <ModuleTag
                    key={module.key}
                    label={module.label}
                    enabled={b[module.key]}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
