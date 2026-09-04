"use client";

import { Inter } from "next/font/google";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/formatDate";
import { getBarangayModules } from "@/lib/getBarangayModules";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
const TABLE_HEADERS = [
  "Barangay",
  "Contact Number",
  "Registered On",
  "Modules",
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
export const BarangayTable = ({ data, isLoading, isError, handleRefetchCount }) => {
  return (
    <Card
      className={`${inter.className} hidden md:flex md:flex-col new-border px-8 overflow-x-auto md:gap-3 md:items-start shadow-none! rounded-xl!`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead style={{ borderBottom: `0.5px solid #e5e7eb` }}>
          <tr>
            {TABLE_HEADERS.map((h) => (
              <th key={h} className="font-medium p-4 text-start text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {isError && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Error handleRefetchCount={handleRefetchCount} subtext={"Unable to load registered barangays. Please try again."}/>
              </td>
            </tr>
          )}
          {!isLoading && !isError && data?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Empty
                  text={"No barangays yet"}
                  subtext={"There are no registered barangays on the platform yet."}
                />
              </td>
            </tr>
          ) : (
            !isLoading &&
            !isError &&
            data?.map((b) => (
              <tr
                key={b?.id}
                // TODO: onClick={() => router.push(`/barangay-accounts/${b.id}`)} once wired
                className="text-start hover:bg-bg hover:cursor-pointer transition-all transform"
              >
                <td className="p-4">
                  <div className="flex flex-col">
                    <p
                      className="font-semibold text-text-primary"
                    >
                      Barangay {b.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.municipality}, {b.province}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{b.contactNumber}</td>
                <td className="p-4 text-gray-600">{formatDate(b.createdAt)}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {MODULE_LABELS.map((module) => (
                      <ModuleTag
                        key={module.key}
                        label={module.label}
                        enabled={b[module.key]}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
};
