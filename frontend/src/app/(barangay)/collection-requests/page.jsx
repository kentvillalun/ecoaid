"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { RequestCard } from "@/components/requests/RequestCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusChip } from "@/components/ui/StatusChip";
import { useState } from "react";
import { Inter } from "next/font/google";
import { RequestTable } from "@/components/requests/RequestTable";
import { useFetch } from "@/hooks/useFetch.js";
import { useUpdate } from "@/hooks/useUpdate";
import { toast } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CollectionRequests() {
  const [refetchCount, setRefetchCount] = useState(1);
  const url = `/api/pickup-requests/collection-requests`;
  const { isLoading, isError, error, data } = useFetch({ url, refetchCount });
  const [currentTab, setCurrentTab] = useState("All");

  const { updateStatus } = useUpdate();
  const [categoriesRefetchCount, setCategotiesRefetchCount] = useState(0);
  const { data: categoriesData } = useFetch({
    url: `/api/material/categories/barangay`,
    refetchCount: categoriesRefetchCount,
  });

  const [selectedApprovedRequests, setSelectedApprovedRequests] = useState([]);

  const handleApprovedRequestSelect = (requestId) => {
    setSelectedApprovedRequests((currentSelected) =>
      currentSelected.includes(requestId)
        ? currentSelected.filter((id) => id !== requestId)
        : [...currentSelected, requestId],
    );
  };

  // setter function for fecth count
  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const handleBatchCollection = async () => {
    try {
      toast.loading("Creating batch collection...");
      const results = await Promise.all(
        selectedApprovedRequests.map(async (id) => {
          return await updateStatus({ id, status: "IN_PROGRESS" });
        }),
      );

      if (results.every(Boolean)) {
        toast.dismiss();
        toast.success("Batch collection created");
        handleRefetchCount();
        setSelectedApprovedRequests([]);
        return true;
      } else {
        toast.error("Batch creation failed");
        return false;
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  

  const STATUS_TABS = [
  { key: ["ALL"], label: "All" },
  { key: ["REQUESTED"], label: "Pending" },
  { key: ["APPROVED"], label: "Approved" },
  { key: ["IN_PROGRESS"], label: "In Progress" },
  { key: ["COLLECTED"], label: "Collected" },
  { key: ["REJECTED"], label: "Rejected" },
  { key: ["CANCELLED", "EXPIRED"], label: "Closed" },
];


  const titles = {
    All: "All Requests",
    Pending: "Pending Requests",
    Approved: "Approved Requests",
    "In Progress": "In Progress Requests",
    Collected: "Collected Requests",
    Rejected: "Rejected Requests",
    Closed: "Expired and Cancelled Requests"
  };

  const pendingCount =
    data?.requests?.filter((item) => item.status === "REQUESTED").length ?? 0;

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Collection Requests" />
      <PageContent className=" md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title={"Collection Requests"}
          subtitle={
            "Review and manage resident pickup requests for recyclable collection."
          }
        />
        <SearchInput />
        <div className="flex flex-col gap-3 relative">
          <div className="sticky -top-6 z-30 bg-bg pt-4">
            <StatusChip
              STATUS_TABS={STATUS_TABS}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              data={data?.requests}
            />
          </div>
          {pendingCount > 0 && (
            <p className="text-sm text-text-primary">
              There {pendingCount === 1 ? "is" : "are"}{" "}
              <span className="font-medium text-accent">
                {pendingCount}
              </span>{" "}
              request{pendingCount === 1 ? "" : "s"} pending. Go to the Pending
              tab to manage {pendingCount === 1 ? "it" : "them"}.
            </p>
          )}
          {currentTab && (
            <div className={`${inter.className}`}>
              <h2 className="font-semibold text-xl pb-2 pl-3 md:pl-0">
                {titles[currentTab]}
              </h2>

              <div className="flex md:hidden flex-col gap-2">
                <RequestCard
                  data={data?.requests}
                  status={currentTab}
                  selectedIds={selectedApprovedRequests}
                  onToggleSelect={handleApprovedRequestSelect}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  handleRefetchCount={handleRefetchCount}
                  STATUS_TABS={STATUS_TABS}
                />
              </div>

              <RequestTable
                data={data?.requests}
                status={currentTab}
                selectedIds={selectedApprovedRequests}
                onToggleSelect={handleApprovedRequestSelect}
                handleRefetchCount={handleRefetchCount}
                isLoading={isLoading}
                isError={isError}
                error={error}
                categories={categoriesData?.categories}
                STATUS_TABS={STATUS_TABS}
              />
            </div>
          )}
        </div>
        {currentTab === "Approved" && selectedApprovedRequests.length > 0 && (
          <div className="fixed bottom-6 left-4 right-4 z-20 md:left-auto md:right-6">
            <button
              className="w-full rounded-2xl gradient-button px-5 py-4 text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:opacity-90 md:w-auto"
              onClick={handleBatchCollection}
            >
              Create Batch Collection ({selectedApprovedRequests.length})
            </button>
          </div>
        )}
      </PageContent>
    </Page>
  );
}
