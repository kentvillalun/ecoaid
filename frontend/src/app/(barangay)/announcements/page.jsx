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
import { StatusChip } from "@/components/ui/StatusChip";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/formatDate";
import { CreateAnnouncementModal } from "@/components/announcements/CreateAnnouncementModal";
import { AnnouncementDetailModal } from "@/components/announcements/AnnouncementDetailModal";
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

const CATEGORY_COLORS = {
  EVENT: "bg-blue-50 text-blue-700",
  REMINDER: "bg-yellow-50 text-yellow-700",
  GENERAL: "bg-gray-100 text-gray-600",
  NOTICE: "bg-purple-50 text-purple-700",
  ALERT: "bg-red-50 text-red-700",
};

const CATEGORY_LABELS = {
  EVENT: "Event",
  REMINDER: "Reminder",
  GENERAL: "General",
  NOTICE: "Notice",
  ALERT: "Alert",
};

const CATEGORY_TABS = [
  { key: "ALL", label: "All" },
  { key: "GENERAL", label: "General" },
  { key: "EVENT", label: "Event" },
  { key: "REMINDER", label: "Reminder" },
  { key: "NOTICE", label: "Notice" },
  { key: "ALERT", label: "Alert" },
];

const TABLE_HEADERS = ["Title", "Posted By", "Date", "Actions"];

export default function AnnouncementsPage() {
  const [currentTab, setCurrentTab] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0)
  const { data, isLoading, isError } = useFetch({ url: "/api/announcements", refetchCount})

  const handleRefetchCount = () => setRefetchCount(prev => prev + 1)

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  const filteredAnnouncements =
    currentTab === "ALL"
      ? data?.announcements
      : data?.announcements?.filter((item) => item.category === currentTab);

  const emptySubtext =
    currentTab === "ALL"
      ? "There are no announcements posted yet."
      : `There are no ${CATEGORY_LABELS[currentTab]} announcements yet.`;



  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Announcements" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header */}
        <BarangayHeaderCard
          title="Announcements"
          subtitle="Manage and publish barangay announcements"
        />

        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Announcements"
            subtitle="All published announcements"
            icon={<MegaphoneIcon className="w-6 stroke-accent" />}
            buttonLabel="Create Announcement"
            onAction={() => setIsCreateModalOpen(true)}
          />

          {/* Category filter tabs */}
          <div className="sticky top-0 z-10 bg-bg pt-1">
            <StatusChip
              STATUS_TABS={CATEGORY_TABS}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          </div>

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
                  ) : filteredAnnouncements?.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_HEADERS.length}>
                        <Empty text="No announcements" subtext={emptySubtext} />
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements?.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4 text-nowrap">
                          <div className="flex flex-row items-center gap-2">
                            <p className="font-bold text-text-primary">
                              {item.title}
                            </p>
                            <Badge
                              label={CATEGORY_LABELS[item.category]}
                              color={CATEGORY_COLORS[item.category]}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-nowrap">
                          <p className="font-semibold text-text-primary">
                            {item.performedBy}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {item.performedByRole.toLowerCase()}
                          </p>
                        </td>
                        <td className="p-4 text-nowrap text-gray-400 text-xs">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            className="text-accent font-medium hover:cursor-pointer text-nowrap"
                            onClick={() => handleViewDetails(item)}
                          >
                            View Details
                          </button>
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
            ) : filteredAnnouncements?.length === 0 ? (
              <Empty text="No announcements" subtext={emptySubtext} />
            ) : (
              filteredAnnouncements?.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col items-start gap-2 shadow-none! new-border hover:cursor-pointer"
                  handleClick={() => handleViewDetails(item)}
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <p className="text-sm font-bold text-text-primary">
                      {item.title}
                    </p>
                    <Badge
                      label={CATEGORY_LABELS[item.category]}
                      color={CATEGORY_COLORS[item.category]}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      {item.performedBy}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {item.performedByRole.toLowerCase()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Modals */}
        <CreateAnnouncementModal
          isOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          handleRefetchCount={handleRefetchCount}
        />

        <AnnouncementDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          setIsDetailModalOpen={setIsDetailModalOpen}
          announcement={selectedAnnouncement}
          handleRefetchCount={handleRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
