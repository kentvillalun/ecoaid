"use client";

import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { IconContainer } from "@/components/ui/IconContainer";
import { SearchInput } from "@/components/ui/SearchInput";
import { formatDate } from "@/lib/formatDate";
import {
  UsersIcon,
  ArrowUpRightIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const STATUS_COLORS = {
  VERIFIED: "bg-green-50 text-green-700",
  UNVERIFIED: "bg-yellow-50 text-yellow-700",
};

const STATUS_LABELS = {
  VERIFIED: "Verified",
  UNVERIFIED: "Unverified",
};

const TABLE_HEADERS = ["Name", "Location", "Contact", "Status", "Registered"];

export default function ResidentsPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/resident/",
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const totalCount = data?.residents?.length;
  const verifiedCount = data?.residents?.filter(
    (r) => r.isVerified === true,
  ).length;
  const unverifiedCount = data?.residents?.filter(
    (r) => r.isVerified === false,
  ).length;
  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Residents" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header */}
        <BarangayHeaderCard
          title="Residents"
          subtitle="Household account & verification status"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Residents
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
              <p className="md:text-2xl font-bold text-text-primary text-base">
                {totalCount}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <UsersIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Registered accounts</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">Verified</p>
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
              <p className="md:text-2xl font-bold text-text-primary text-base">
                {verifiedCount}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <CheckBadgeIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">Verified accounts</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start col-span-2 lg:col-span-1">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">Unverified</p>
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
              <p className="md:text-2xl font-bold text-text-primary text-base">
                {unverifiedCount}
              </p>
            )}
            <div className="flex flex-row items-center w-auto bg-accent/10 px-3 py-1 rounded-xl text-xs gap-1">
              <ExclamationCircleIcon className="w-3 stroke-accent" />
              <p className="text-accent font-medium">
                No completed transactions yet
              </p>
            </div>
          </Card>
        </section>

        <SearchInput />

        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Residents"
            subtitle="All registered residents in your barangay"
            icon={<UsersIcon className="w-6 stroke-accent" />}
            noButton
          />

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
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
                  ) : data?.residents?.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_HEADERS.length}>
                        <Empty
                          text="No residents"
                          subtext="There are no registered residents yet."
                        />
                      </td>
                    </tr>
                  ) : (
                    data?.residents?.map((resident) => (
                      <tr
                        key={resident.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4 font-bold text-text-primary text-nowrap">
                          {resident.firstName} {resident.lastName}
                        </td>
                        <td className="p-4 text-gray-500 text-xs text-nowrap">
                          {resident.address
                            ? `${resident.address}, ${resident.purok}`
                            : resident.purok}
                        </td>
                        <td className="p-4 text-gray-500 text-nowrap">
                          {resident.phoneNumber}
                        </td>
                        <td className="p-4">
                          <Badge
                            label={
                              STATUS_LABELS[
                                resident.isVerified ? "VERIFIED" : "UNVERIFIED"
                              ]
                            }
                            color={
                              STATUS_COLORS[
                                resident.isVerified ? "VERIFIED" : "UNVERIFIED"
                              ]
                            }
                          />
                        </td>
                        <td className="p-4 text-nowrap text-gray-400 text-xs">
                          {formatDate(resident.createdAt)}
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Skeleton width={160} />
                    <Skeleton width={50} />
                  </div>
                  <Skeleton width={120} />
                  <Skeleton width={90} />
                </Card>
              ))
            ) : isError ? (
              <Error handleRefetchCount={handleRefetchCount} />
            ) : data?.residents?.length === 0 ? (
              <Empty
                text="No residents"
                subtext="There are no registered residents yet."
              />
            ) : (
              data?.residents?.map((resident) => (
                <Card
                  key={resident.id}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <p className="text-sm font-bold text-text-primary">
                      {resident.firstName} {resident.lastName}
                    </p>
                    <Badge
                      label={
                        STATUS_LABELS[
                          resident.isVerified ? "VERIFIED" : "UNVERIFIED"
                        ]
                      }
                      color={
                        STATUS_COLORS[
                          resident.isVerified ? "VERIFIED" : "UNVERIFIED"
                        ]
                      }
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {resident.address
                        ? `${resident.address}, ${resident.purok}`
                        : resident.purok}
                    </p>
                    <p className="text-xs text-gray-500">
                      {resident.phoneNumber}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(resident.createdAt)}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
