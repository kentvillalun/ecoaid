"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { Card } from "@/components/ui/Card";
import { LabelValue } from "@/components/ui/LabelValue";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { formatDate } from "@/lib/formatDate";
import { THEMES } from "@/lib/themes";
import { useFetch } from "@/hooks/useFetch";
import { StaffTable } from "@/components/admin/barangay-accounts/StaffTable";
import { AddStaffModal } from "@/components/admin/barangay-accounts/AddStaffModal";
import { SitiosSection } from "@/components/admin/barangay-accounts/SitiosSection";
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Same hardcoded module tag styling as BarangayTable/BarangayCard — Super
// Admin is platform-level and never themed per-barangay.
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

const CardHeader = ({ title, subtitle }) => (
  <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 w-full">
    <h3 className="font-semibold text-base md:text-base text-text-primary">
      {title}
    </h3>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

export default function BarangayAccountDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [barangay, setBarangay] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0);
  const [staffRefetchCount, setStaffRefetchCount] = useState(0);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [sitiosRefetchCount, setSitiosRefetchCount] = useState(0);

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);
  const handleStaffRefetchCount = () => setStaffRefetchCount((prev) => prev + 1);
  const handleSitiosRefetchCount = () => setSitiosRefetchCount((prev) => prev + 1);

  const {
    data: staffData,
    isLoading: isStaffLoading,
    isError: isStaffError,
  } = useFetch({
    url: id ? `/api/admin/barangays/${id}/staff` : null,
    refetchCount: staffRefetchCount,
  });

  const {
    data: sitiosData,
    isLoading: isSitiosLoading,
    isError: isSitiosError,
  } = useFetch({
    url: id ? `/api/admin/barangays/${id}/sitios` : null,
    refetchCount: sitiosRefetchCount,
  });

  console.log(staffData)
  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setIsNotFound(false);

        const response = await fetch(`/api/admin/barangays/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          setIsError(true);
          return;
        }

        setBarangay(result?.barangay);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!id) return;

    fetchBarangay();
  }, [id, refetchCount]);

  const theme = THEMES[barangay?.themeAccent];

  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Barangay Details" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <div className="grid grid-cols-1 gap-3">
          {/* Header card — always visible, independent of loading/error state */}
          <Card className="flex flex-row items-center gap-4 shadow-none! new-border">
            <Link
              href="/barangay-accounts"
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
            </Link>

            <div className="flex flex-row gap-4 items-center flex-1">
              <div className="border p-3 border-gray-200 rounded-lg md:flex items-center hidden bg-white">
                <BuildingOffice2Icon className="w-6 stroke-admin-accent" />
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="font-semibold text-xl">
                  {barangay?.name ? `Barangay ${barangay.name}` : "Barangay Details"}
                </h2>
                <p className="text-sm text-gray-500">
                  {barangay?.municipality && barangay?.province
                    ? `${barangay.municipality}, ${barangay.province}`
                    : "View barangay account details"}
                </p>
              </div>
            </div>

            <Link
              href={`/barangay-accounts/${id}/edit`}
              className="flex md:hidden items-center text-sm text-admin-accent hover:underline hover:cursor-pointer"
            >
              Edit
            </Link>
            <Link
              href={`/barangay-accounts/${id}/edit`}
              className="hidden md:flex items-center gap-1.5 py-3 px-4 text-sm text-white rounded-lg hover:cursor-pointer gradient-button-admin transition-all duration-200 ease-in-out"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit
            </Link>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full">
              <Error handleRefetchCount={handleRefetchCount} />
            </div>
          ) : isNotFound ? (
            <div className="flex items-center justify-center h-full">
              <Error
                text="Barangay not found"
                subtext="This barangay may have been removed, or the link is incorrect."
                buttonLabel="Back to barangays"
                handleRefetchCount={() => router.push("/barangay-accounts")}
              />
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
                <CardHeader
                  title="Basic Information"
                  subtitle="Core details about the barangay"
                />

                <LabelValue name="Barangay name" value={barangay?.name} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <LabelValue
                    name="Municipality"
                    value={barangay?.municipality}
                  />
                  <LabelValue name="Province" value={barangay?.province} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <LabelValue name="Zip code" value={barangay?.zipCode} />
                  <LabelValue
                    name="Contact number"
                    value={barangay?.contactNumber}
                  />
                </div>
                <LabelValue
                  name="Registered on"
                  value={formatDate(barangay?.createdAt)}
                />
              </Card>

              {/* Sitios */}
              <SitiosSection
                barangayId={id}
                sitios={sitiosData?.sitios}
                isLoading={isSitiosLoading}
                isError={isSitiosError}
                handleRefetchCount={handleSitiosRefetchCount}
              />

              {/* Theme and Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
                  <CardHeader
                    title="Theme"
                    subtitle="Color theme assigned to this barangay"
                  />
                  <LabelValue
                    name="Theme preset"
                    value={theme?.name ?? "Not set"}
                  />
                </Card>

                <Card className="flex flex-col items-start gap-1 shadow-none! new-border">
                  <CardHeader
                    title="Modules"
                    subtitle="Modules enabled for this barangay"
                  />
                  <div className="flex flex-wrap gap-1.5 w-full pt-3">
                    {MODULE_LABELS.map((module) => (
                      <ModuleTag
                        key={module.key}
                        label={module.label}
                        enabled={barangay?.[module.key]}
                      />
                    ))}
                  </div>
                </Card>
              </div>

              {/* Staff Accounts */}
              <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
                <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 w-full">
                  <div className="flex flex-row gap-4 items-center">
                    <div className="new-border p-3 rounded-xl md:flex items-center hidden bg-white">
                      <UserGroupIcon className="w-6 stroke-admin-accent" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-base md:text-base text-text-primary">
                        Staff Accounts
                      </h3>
                      <p className="text-xs text-gray-400">
                        Manage this barangay&apos;s staff logins
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(true)}
                    className="flex md:hidden items-center text-sm text-admin-accent hover:underline hover:cursor-pointer"
                  >
                    Add staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(true)}
                    className="hidden md:flex flex-row items-center gap-1.5 py-3 px-4 text-sm text-white rounded-lg hover:cursor-pointer gradient-button-admin transition-all duration-200 ease-in-out text-nowrap"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add staff
                  </button>
                </div>

                <StaffTable
                  accounts={staffData?.accounts}
                  isLoading={isStaffLoading}
                  isError={isStaffError}
                  handleRefetchCount={handleStaffRefetchCount}
                />
              </Card>
            </>
          )}
        </div>
      </PageContent>

      <AddStaffModal
        isOpen={isStaffModalOpen}
        barangayId={id}
        handleStaffRefetchCount={handleStaffRefetchCount}
        onClose={() => setIsStaffModalOpen(false)}
      />
    </Page>
  );
}
