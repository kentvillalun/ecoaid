"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { IconContainer } from "@/components/ui/IconContainer";
import { formatDate } from "@/lib/formatDate";
import { AddRewardItemModal } from "@/components/reward/AddRewardItemModal";
import { ReleaseRewardModal } from "@/components/reward/ReleaseRewardModal";
import {
  ArrowUpRightIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  TruckIcon,
  UserGroupIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const CATEGORY_COLORS = {
  MEDICINE: "bg-red-50 text-red-700",
  GOODS: "bg-blue-50 text-blue-700",
  SCHOOL_SUPPLIES: "bg-yellow-50 text-yellow-700",
  SERVICES: "bg-purple-50 text-purple-700",
  OTHERS: "bg-gray-100 text-gray-600",
};

const CATEGORY_LABELS = {
  MEDICINE: "Medicine",
  GOODS: "Goods",
  SCHOOL_SUPPLIES: "School Supplies",
  SERVICES: "Services",
  OTHERS: "Others",
};

const REWARD_HEADERS = ["Program", "Category", "Name", "Available", "Added On"];
const HISTORY_HEADERS = [
  "Item",
  "Program",
  "Quantity",
  "Beneficiary",
  "Released By",
  "Date",
];

export default function RewardInventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [summaryRefetchCount, setSummaryRefetchCount] = useState(0);
  const {
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    data: summaryData,
  } = useFetch({
    url: "/api/rewards/summary",
    refetchCount: summaryRefetchCount,
  });

  const [rewardItemsRefetchCount, setRewardItemRefetchCount] = useState(0);
  const {
    data: rewardItemsData,
    isLoading: isRewardItemsLoading,
    isError: isRewardItemsError,
  } = useFetch({ url: "/api/rewards", refetchCount: rewardItemsRefetchCount });

  const [releaseRefetchCount, setReleaseRefetchCount] = useState(0);
  const {
    data: releaseData,
    isLoading: isReleaseLoading,
    isError: isReleaseError,
  } = useFetch({
    url: "/api/rewards/release",
    refetchCount: releaseRefetchCount,
  });

  const handleSummaryRefetchCount = () =>
    setSummaryRefetchCount((prev) => prev + 1);

  const handleRewardItemsRefetchCount = () =>
    setRewardItemRefetchCount((prev) => prev + 1);

  const handleReleaseRefetchCount = () =>
    setReleaseRefetchCount((prev) => prev + 1);
  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Reward Inventory" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header */}
        <BarangayHeaderCard
          title="Reward Inventory"
          subtitle="Manage reward stock and track distributions"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">Total Items</p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-base">
              {isSummaryLoading ? (
                <Skeleton width={110} />
              ) : (
                (summaryData?.totalItems ?? 0)
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ArchiveBoxIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Reward items tracked</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Available
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-base">
              {isSummaryLoading ? (
                <Skeleton width={120} />
              ) : (
                (summaryData?.totalAvailable ?? 0)
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <CheckCircleIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Ready to distribute</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Released
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-base">
              {isSummaryLoading ? (
                <Skeleton width={120} />
              ) : (
                (summaryData?.totalReleased ?? 0)
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <TruckIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Distributed items</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Beneficiaries
              </p>
              <IconContainer
                icon={<ArrowUpRightIcon className="w-3 stroke-text-secondary" />}
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-text-primary text-base">
              {isSummaryLoading ? (
                <Skeleton width={120} />
              ) : (
                (summaryData?.distinctBeneficiaries ?? 0)
              )}
            </p>
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <UserGroupIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Unique recipients</p>
            </div>
          </Card>
          {isSummaryError && (
            <div className="col-span-2 md:cols-span-4 w-full text-xs md:text-sm text-text-secondary">
              Unable to load reward summary.{" "}
              <button
                className="text-accent font-medium"
                onClick={() => handleSummaryRefetchCount()}
              >
                Please try again
              </button>
            </div>
          )}
        </section>

        {/* Reward Items */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Reward Items"
            subtitle="Current stock available for distribution"
            icon={<GiftIcon className="w-6 stroke-accent" />}
            buttonLabel="Add Item"
            onAction={() => setIsAddModalOpen(true)}
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {REWARD_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="font-medium text-start p-4 text-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isRewardItemsLoading ? (
                    <tr>
                      <td colSpan={REWARD_HEADERS.length}>
                        <Spinner className="pt-10!" />
                      </td>
                    </tr>
                  ) : isRewardItemsError ? (
                    <tr>
                      <td colSpan={REWARD_HEADERS.length}>
                        <Error
                          text={"Unable to load reward items"}
                          subtext={
                            "Unable to get reward inventory. Please try again."
                          }
                          handleRefetchCount={handleRewardItemsRefetchCount}
                        />
                      </td>
                    </tr>
                  ) : rewardItemsData?.rewardItems?.length === 0 ? (
                    <tr>
                      <td colSpan={REWARD_HEADERS.length}>
                        <Empty
                          text={"No reward items yet"}
                          subtext={
                            "No items in inventory. Please Add Item to get started."
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    rewardItemsData?.rewardItems?.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4 font-medium text-text-primary text-nowrap">
                          {item.programName}
                        </td>
                        <td className="p-4">
                          <Badge
                            className="text-nowrap"
                            label={CATEGORY_LABELS[item.category]}
                            color={CATEGORY_COLORS[item.category]}
                          />
                        </td>
                        <td className="p-4 text-nowrap">{item.name}</td>
                        <td className="p-4 text-nowrap">
                          <span
                            className={`font-bold tabular-nums ${item.available > 0 ? "text-green-700" : "text-red-600"}`}
                          >
                            {item.available > 0
                              ? item.available
                              : "Out of stock"}
                          </span>
                        </td>
                        <td className="p-4 text-nowrap text-gray-400 text-xs">
                          {formatDate(item.createdAt)}
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
            {isRewardItemsLoading ? (
              Array.from({ length: 1 }, (_, i) => (
                <Card
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                  key={i}
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Skeleton width={250} />
                    <Skeleton width={115} />
                  </div>
                  <Skeleton width={150} />
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <Skeleton width={95} />
                    <Skeleton width={135} />
                  </div>
                </Card>
              ))
            ) : isRewardItemsError ? (
              <Error
                className="p-5!"
                text={"Unable to load reward items"}
                subtext={"Unable to get reward inventory. Please try again."}
                handleRefetchCount={handleRewardItemsRefetchCount}
              />
            ) : rewardItemsData?.rewardItems?.length === 0 ? (
              <Empty
                className="p-5!"
                text={"No reward items yet"}
                subtext={
                  "No items in inventory. Please Add Item to get started."
                }
              />
            ) : (
              rewardItemsData?.rewardItems?.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {item.programName}
                    </p>
                    <Badge
                      label={CATEGORY_LABELS[item.category]}
                      color={CATEGORY_COLORS[item.category]}
                    />
                  </div>
                  <p className="text-sm font-bold text-text-primary">
                    {item.name}
                  </p>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <span
                      className={`text-sm font-bold tabular-nums ${item.available > 0 ? "text-green-700" : "text-red-600"}`}
                    >
                      {item.available > 0
                        ? `${item.available} available`
                        : "Out of stock"}
                    </span>
                    <p className="text-xs text-gray-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Release History */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Release History"
            subtitle="Record of all reward distributions"
            icon={
              <ClipboardDocumentListIcon className="w-6 stroke-accent" />
            }
            buttonLabel="Release Reward"
            onAction={() => setIsReleaseModalOpen(true)}
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {HISTORY_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="font-medium text-start p-4 text-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isReleaseLoading ? (
                    <tr>
                      <td colSpan={HISTORY_HEADERS.length}>
                        <Spinner className="pt-10!" />
                      </td>
                    </tr>
                  ) : isReleaseError ? (
                    <tr>
                      <td colSpan={HISTORY_HEADERS.length}>
                        <Error
                          text={"Unable to load release history"}
                          subtext={
                            "Unable to get reward release records. Please try again."
                          }
                          handleRefetchCount={handleReleaseRefetchCount}
                        />
                      </td>
                    </tr>
                  ) : releaseData?.rewardReleases?.length === 0 ? (
                    <tr>
                      <td colSpan={HISTORY_HEADERS.length}>
                        <Empty
                          text={"No releases yet"}
                          subtext={"No rewards have been distributed yet."}
                        />
                      </td>
                    </tr>
                  ) : (
                    releaseData?.rewardReleases?.map((entry) => (
                      <tr
                        key={entry?.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4 font-medium text-text-primary text-nowrap">
                          {entry?.rewardItem?.name}
                        </td>
                        <td className="p-4 text-nowrap">
                          {entry?.program?.name}
                        </td>
                        <td className="p-4 font-bold text-text-primary tabular-nums text-nowrap">
                          {entry.quantity}
                        </td>
                        <td className="p-4 text-nowrap">
                          {entry.beneficiaryName}
                        </td>
                        <td className="p-4 text-nowrap">
                          <p className="font-semibold text-text-primary">
                            {entry.performedBy}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {entry.performedByRole.toLowerCase()}
                          </p>
                        </td>
                        <td className="p-4 text-nowrap text-gray-400 text-xs">
                          {formatDate(entry.createdAt)}
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
            {isReleaseLoading ? (
              Array.from({ length: 1 }, (_, i) => (
                <Card
                  key={i}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Skeleton width={150} />
                    <Skeleton width={30} />
                  </div>
                  <Skeleton width={150} />
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <div>
                      <Skeleton width={150} />
                      <Skeleton width={50} />
                    </div>
                    <Skeleton width={130} />
                  </div>
                </Card>
              ))
            ) : isReleaseError ? (
              <Error
                text={"Unable to load release history"}
                subtext={
                  "Unable to get reward release records. Please try again."
                }
                handleRefetchCount={handleReleaseRefetchCount}
              />
            ) : releaseData?.rewardReleases?.length === 0 ? (
              <Empty
                text={"No releases yet"}
                subtext={"No rewards have been distributed yet."}
              />
            ) : (
              releaseData?.rewardReleases?.map((entry) => (
                <Card
                  key={entry.id}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <p className="text-sm font-bold text-text-primary">
                      {entry.rewardItem?.name}
                    </p>
                    <p className="text-sm font-bold text-accent tabular-nums">
                      x{entry.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {entry.beneficiaryName}
                  </p>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        {entry.performedBy}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {entry.performedByRole.toLowerCase()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Modals */}
        <AddRewardItemModal
          isOpen={isAddModalOpen}
          setIsModalOpen={setIsAddModalOpen}
          handleRewardItemsRefetchCount={handleRewardItemsRefetchCount}
          handleSummaryRefetchCount={handleSummaryRefetchCount}
        />

        <ReleaseRewardModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
          handleReleasesRefetchCount={handleReleaseRefetchCount}
          handleSummaryRefetchCount={handleSummaryRefetchCount}
          handleItemsRefetchCount={handleRewardItemsRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
