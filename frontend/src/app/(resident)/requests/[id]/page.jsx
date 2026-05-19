"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Banner } from "@/components/ui/Banner";
import Image from "next/image";
import { MaterialPill } from "@/components/ui/MateriaPill";
import { formatDate } from "@/lib/formatDate";
import { statusStyles } from "@/lib/statusStyles";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Error } from "@/components/ui/Error";

export default function RequestDetailPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { id } = useParams();
  const url = `/api/pickup-requests/my-requests/${id}`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });

  const timelineEvents = [
    { label: "Submitted", value: data?.request?.createdAt, show: true },
    {
      label: "Approved",
      value: data?.request?.approvedAt,
      show: ["APPROVED", "IN_PROGRESS", "COLLECTED"].includes(
        data?.request?.status,
      ),
    },
    {
      label: "In Progress",
      value: data?.request?.approvedAt,
      show: ["IN_PROGRESS"].includes(data?.request?.status),
    },
    {
      label: "Collected",
      value: data?.request?.collectedAt,
      show: data?.request?.status === "COLLECTED",
    },
    {
      label: "Rejected",
      value: data?.request?.rejectedAt,
      show: data?.request?.status === "REJECTED",
    },
  ].filter((e) => e.show);

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1)

  return (
    <Page gradient={false} className="bg-[#F3F3FF]! overflow-hidden">
      <ResidentHeader title={"Request Details"} />
      <PageContent withBottomNav={false} className="gap-0 px-0 py-0 md:pl-0! md:top-18! ">
        <Banner status={data?.request?.status} />
        {isLoading ? (
          <>
            <div className="w-full h-48 overflow-hidden">
              <Skeleton height={192} width={800} />
            </div>
            <div className="p-3 border-b border-gray-300 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Request Information
              </h3>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">Material</p>
                  <Skeleton width={100} />
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    Estimated weight
                  </p>
                  <p className={`text-sm text-gray-600 lowercase`}>
                    <Skeleton width={100} />
                  </p>
                </div>
                <div className="flex flex-col items-start justify-between gap-2 pb-2">
                  <p className="text-gray-600 text-sm font-medium">Notes</p>
                  <Skeleton width={800} height={100} />
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">Submitted</p>
                  <p className={`text-sm text-gray-600`}>
                    {formatDate(data?.request?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-300 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Status Timeline
              </h3>
              
              <div className="flex flex-col w-full">
                {timelineEvents.map((event, i) => (
                  <div
                    key={event.label}
                    className={`flex flex-row gap-3 ${i < timelineEvents.length - 1 ? "pb-4" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                     <Skeleton width={20} />

                      {i < timelineEvents.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-between">
                     <Skeleton width={100} />
                    <Skeleton width={150} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Collection details
              </h3>
              {data?.request?.status !== "COLLECTED" ? (
                <>
                  <Skeleton width={800} />
                  <Skeleton width={50} />
                </>
              ) : (
                <div className="w-full flex flex-col gap-2 px-4">
                  <div className="flex flex-row items-center justify-between gap-2 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Material
                    </p>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Actual weight
                    </p>
                  </div>
                  {data?.request?.collectionItems.map((item, index) => (
                    <div
                      className="flex flex-row items-center justify-between gap-2 w-full border-gray-100"
                      key={index}
                    >
                      <Skeleton width={150}/>
                      <Skeleton width={40}/>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : isError ? (
         
          <Error subtext={"We couldn't load this requests"} buttonLabel={"Try again"} handleRefetchCount={handleRefetchCount} className="p-20" />
        
        ) : (
          <>
            <div className="w-full h-70 ">
              {data?.request?.photoUrl && (
                <Image
                  src={data.request.photoUrl}
                  alt="recyclables"
                  width={800}
                  height={192}
                  className="object-cover w-full h-full"
                  style={{ height: "192px" }}
                  priority
                />
              )}
            </div>
            <div className="p-3 border-b border-gray-300 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Request Information
              </h3>

              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">Category</p>
                  <MaterialPill
                    type={data?.request?.isAssorted === true ? "Assorted" : data?.request?.material?.category?.name}
                    className="w-auto"
                  />
                </div>

                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">Material name</p>
                  <p className={`text-sm text-gray-600`}>
                    {data?.request?.isAssorted === true ? "Assorted" : data?.request?.material?.category?.name}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    Estimated value and unit
                  </p>
                  <p className={`text-sm text-gray-600 lowercase`}>
                    {data?.request?.estimatedValue} {data?.request?.estimatedUnit === "PIECE" ? "pcs" : data?.request?.estimatedUnit}
                  </p>
                </div>
                <div className="flex flex-col items-start justify-between gap-2 pb-2">
                  <p className="text-gray-600 text-sm font-medium">Notes</p>
                  <textarea
                    rows={3}
                    value={data?.request?.notes ? data?.request?.notes : "There is no notes available for this request"}
                    className="text-sm text-gray-600 lowercase w-full p-2 outline-none border rounded-md border-gray-300 "
                    disabled
                  ></textarea>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-gray-600 text-sm font-medium">Submitted</p>
                  <p className={`text-sm text-gray-600`}>
                    {formatDate(data?.request?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-300 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Status Timeline
              </h3>
              <div className="flex flex-col w-full">
                {timelineEvents.map((event, i) => (
                  <div
                    key={event.label}
                    className={`flex flex-row gap-3 ${i < timelineEvents.length - 1 ? "pb-4" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          i === timelineEvents.length - 1
                            ? statusStyles[data?.request?.status]
                            : "bg-primary"
                        }`}
                      />

                      {i < timelineEvents.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-between">
                      <p className="text-gray-600 text-sm font-medium">
                        {event.label}
                      </p>
                      <p className={`text-sm text-gray-600`}>
                        {event.label === "In Progress"
                          ? "Being collected"
                          : formatDate(event.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 w-full uppercase">
                Collection details
              </h3>
              {data?.request?.status !== "COLLECTED" ? (
                <p className="italic text-sm text-gray-500">
                  Shown when request is collected. Actual weights and material
                  breakdown appear here.
                </p>
              ) : (
                <div className="w-full flex flex-col gap-2 px-4">
                  <div className="grid grid-cols-3 items-center justify-between gap-2 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Category
                    </p>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Material
                    </p>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Actual values
                    </p>
                  </div>
                  {data?.request?.collectionItems.map((item, index) => (
                    <div
                      className="grid grid-cols-3 items-center justify-between gap-2 w-full border-gray-100"
                      key={index}
                    >
                      <MaterialPill type={item?.material?.category?.name} />

                      <p className="text-sm text-gray-700">
                        {item?.material?.name}
                      </p>
                      <p className="text-sm text-gray-700 lowercase">
                        {item.actualValue} {item.actualUnit === "PIECE" ? "pcs" : item.actualUnit}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </PageContent>
    </Page>
  );
}
