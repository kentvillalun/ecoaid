"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Error } from "@/components/ui/Error";
import { formatDate } from "@/lib/formatDate";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Empty } from "@/components/ui/Empty";
import { useRouter } from "next/navigation";
import { MaterialPill } from "@/components/ui/MateriaPill";

export default function RequestsPage() {
  const [currentTab, setCurrectTab] = useState("ongoing"); // 'ongoing' || 'completed'
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/pickup-requests/my-requests`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });
  const router = useRouter();

  const filteredRequests =
    currentTab === "ongoing"
      ? data?.requests?.filter((r) =>
          ["REQUESTED", "APPROVED", "IN_PROGRESS"].includes(r.status),
        )
      : data?.requests?.filter((r) =>
          ["COLLECTED", "REJECTED"].includes(r.status),
        );

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  return (
    <Page gradient={true}>
      <ResidentHeader title={"Requests & History"} notification={true} />

      <PageContent className="overflow-hidden!" padding="py-4 px-3">
        {/* Tab section */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-2 ">
            <button
              className={`rounded-2xl shadow-lg py-3 font-medium text-[#727272] ${currentTab === "ongoing" ? "text-white bg-[#89D957]" : "bg-white"} transition-all duration-250 ease-out`}
              onClick={() => setCurrectTab("ongoing")}
            >
              Ongoing
            </button>
            <button
              className={`rounded-2xl shadow-lg py-3 font-medium text-[#727272] ${currentTab === "history" ? "text-white bg-[#89D957]" : "bg-white"} `}
              onClick={() => setCurrectTab("history")}
            >
              History
            </button>
          </div>

          <PageContent>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Card
                    className={`flex flex-row items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out`}
                    key={index}
                  >
                    {/* Top row */}
                    <div className="flex flex-col items-start h-16 w-16 rounded-md overflow-hidden shrink-0">
                      <Skeleton width={64} height={64} />
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col  items-start justify-between">
                          <Skeleton width={55} />
                          <Skeleton width={100} />
                          <Skeleton width={150} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Skeleton width={120} />
                          <Skeleton width={120} />
                        </div>
                      </div>

                      {/* Footer row */}
                      <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
                        <Skeleton width={100} />
                      </div>
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
                  <Card
                    className={`flex flex-row items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out`}
                    key={r.id}
                    handleClick={() => router.push(`/requests/${r.id}`)}
                  >
                    {/* Top row */}
                    <div className="flex flex-col items-start h-16 w-16 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={r?.photoUrl}
                        width={64}
                        height={64}
                        alt="Recyclables"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col  items-start justify-between">
                          <h3 className="font-semibold text-[#1F2937] capitalize">
                            {r.isAssorted === true
                              ? "Assorted Request"
                              : r.material?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {r.notes ? r.notes : "No notes available"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Pill type={r.status} />
                          <MaterialPill type={r?.isAssorted === true ? "Assorted" : r?.material?.category?.name}/>
                        </div>
                      </div>

                      {/* Footer row */}
                      <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Est. {r.estimatedValue}{" "}
                          <span className="lowercase">{r.estimatedUnit === "PIECE" ? "pcs" : r.estimatedUnit}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </PageContent>
        </div>
      </PageContent>
    </Page>
  );
}
