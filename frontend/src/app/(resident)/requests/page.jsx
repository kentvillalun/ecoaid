"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Error } from "@/components/ui/Error";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Empty } from "@/components/ui/Empty";
import { ResidentRequestCard } from "@/components/requests/ResidentRequestCard";

export default function RequestsPage() {
  const [currentTab, setCurrectTab] = useState("ongoing"); // 'ongoing' || 'completed'
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/pickup-requests/my-requests`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });

  const filteredRequests =
    currentTab === "ongoing"
      ? data?.requests?.filter((r) =>
          ["REQUESTED", "APPROVED", "IN_PROGRESS"].includes(r.status),
        )
      : data?.requests?.filter((r) =>
          ["COLLECTED", "REJECTED", "EXPIRED", "CANCELLED"].includes(r.status),
        );

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  return (
    <Page className="overflow-hidden bg-bg">
      <ResidentHeader
        title={"Requests & History"}
        action={"notification"}
        className="shadow-none bg-bg!"
      />

      <PageContent
        className="overflow-hidden! md:top-18 md:pl-3!"
        padding="py-4 px-3"
      >
        {/* Tab section */}
        <div className="flex flex-col gap-6 mt-2">
          <div className="grid grid-cols-2 gap-2 z-50 bg-bg pb-3">
            <button
              className={`rounded-2xl py-3 font-medium text-gray-600 new-border ${currentTab === "ongoing" ? "text-white gradient-button" : "bg-white"} transition-all duration-250 ease-out`}
              onClick={() => setCurrectTab("ongoing")}
            >
              Ongoing
            </button>
            <button
              className={`rounded-2xl py-3 font-medium new-border text-gray-600 ${currentTab === "history" ? "text-white gradient-button" : "bg-white"} `}
              onClick={() => setCurrectTab("history")}
            >
              History
            </button>
          </div>

          <PageContent className="md:pl-3! md:top-18! ">
            <div className="flex flex-col gap-2">
              {isLoading ? (
                Array.from({ length: 1 }).map((_, index) => (
                  <Card
                    className="flex-col! items-start! gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out shadow-none! new-border"
                    key={index}
                  >
                    {/* Top row */}
                    <div className="flex flex-row justify-between w-full">
                      <div className="flex flex-row gap-3">
                        <div className="flex flex-col items-start h-16 w-16 rounded-md overflow-hidden shrink-0">
                          <Skeleton width={64} height={64} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <Skeleton width={55} />
                          <Skeleton width={100} />
                          <Skeleton width={150} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Skeleton width={120} />
                        <Skeleton width={120} />
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                      <Skeleton width={100} />
                    </div>
                  </Card>
                ))
              ) : isError ? (
                <Error
                  buttonLabel={"Try again"}
                  buttonClassName="py-2! px-6! text-sm!"
                  subtext={"We coudn't load your requests"}
                  handleRefetchCount={handleRefetchCount}
                  className="pt-30!"
                />
              ) : filteredRequests?.length === 0 ? (
                <Empty
                  text={"No request yet"}
                  subtext={"Tap the camera button to submit your first request"}
                />
              ) : (
                filteredRequests?.map((r) => (
                  <ResidentRequestCard key={r.id} request={r} variant="list" />
                ))
              )}
            </div>
          </PageContent>
        </div>
      </PageContent>
    </Page>
  );
}
