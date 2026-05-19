"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { RequestDetailHeader } from "@/components/requests/RequestDetailHeader";
import { Card } from "@/components/ui/Card";
import { LabelValue } from "@/components/ui/LabelValue";
import { formatDate } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { PendingActions } from "@/components/requests/actions/PendingActions";
import { ApprovedActions } from "@/components/requests/actions/ApprovedActions";
import { InProgressActions } from "@/components/requests/actions/InProgressActions";
import { useRouter } from "next/navigation";
import { CameraIcon } from "@heroicons/react/24/outline";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";
import { Error } from "@/components/ui/Error";

export default function RequestDetails() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { id } = useParams();
  const url = `/api/pickup-requests/collection-requests/${id}`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const [categoriesRefetchCount, setCategotiesRefetchCount] = useState(0)
  const { data: categoriesData } = useFetch({ url: `/api/material/categories`, refetchCount: categoriesRefetchCount})

  if (isLoading)
    return (
      <div className="text-center">
        <div className="md:hidden">
          <SkeletonCard />
        </div>
        <div className="md:pl-77 flex items-center min-h-screen justify-center">
          <Spinner />
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="md:pl-77 flex items-center justify-center min-h-screen">
        <Error handleRefetchCount={handleRefetchCount} />
      </div>
    );

  const router = useRouter();
  const req = data?.request;
  const status = req?.status;

  // Build timeline events based on status
  const timelineEvents = [
    { label: "Submitted", value: req?.createdAt, show: true },
    {
      label: "Approved",
      value: req?.approvedAt,
      show: ["APPROVED", "IN_PROGRESS", "COLLECTED"].includes(status),
    },
    {
      label: "Collected",
      value: req?.collectedAt,
      show: status === "COLLECTED",
    },
    { label: "Rejected", value: req?.rejectedAt, show: status === "REJECTED" },
  ].filter((e) => e.show);

  return (
    <Page gradient={true}>
      <BarangayTopBar title={"Collection Request"} />
      <PageContent className="md:pl-80 md:p-6 md:gap-7">
        <RequestDetailHeader type={status} />

        <div className="grid grid-cols-1 gap-3">
          {/* Info cards row */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${status !== "COLLECTED" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
          >
            <Card className="flex flex-col items-start gap-3">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                Resident Information
              </h3>
              <LabelValue
                name={"Full name"}
                value={`${req?.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Name not set"}`}
              />
              <LabelValue
                name={"Contact number"}
                value={req?.user?.phoneNumber}
              />
              <LabelValue name={"Sitio"} value={req?.user?.sitio?.name} />
            </Card>

            <Card className="flex flex-col items-start gap-3">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                Request Information
              </h3>
              <LabelValue name={"Material category"} value={req?.isAssorted === true ? "Assorted" : req?.material?.category?.name} />
              <LabelValue name={"Material name"} value={req?.isAssorted === true ? "Assorted" : req?.material?.name} />
              <LabelValue
                name={"Estimated values"}
                value={`${req?.estimatedValue} ${req?.estimatedUnit === "PIECE" ? "pcs" : req?.estimatedUnit}`}
              />
              <LabelValue
                name={"Notes"}
                value={req?.notes || "No notes available"}
              />
              {status === "REJECTED" && (
                <LabelValue
                  name={"Rejection reason"}
                  value={req?.rejectionReason}
                />
              )}
            </Card>

            {status === "COLLECTED" && (
              <Card className="flex flex-col items-start gap-3 md:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Finalized Collection
                </h3>
                <div className="w-full flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Material
                    </p>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Value
                    </p>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      Unit
                    </p>
                  </div>
                  {req?.collectionItems.map((item, index) => (
                    <div
                      className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-gray-100"
                      key={index}
                    >
                      <p className="text-sm text-gray-700">
                        {item?.material?.name}
                      </p>
                      <p className="text-sm text-gray-700">
                        {item.actualValue}
                      </p>
                      <p className="text-sm text-gray-700">{item.actualUnit === "PIECE" ? "pcs" : item.actualUnit}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Photo evidence */}
          <Card className="flex flex-col items-start gap-3">
            <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
              Photo Evidence
            </h3>
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-lg w-full overflow-hidden md:max-h-80">
              {req?.photoUrl ? (
                <img
                  src={req?.photoUrl}
                  alt="Captured recyclables"
                  className="object-contain md:w-full md:h-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 my-8">
                  <CameraIcon className="w-8 stroke-gray-300" />
                  <p className="text-sm text-gray-400">No photo uploaded</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="flex flex-col items-start gap-3">
            <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
              Timeline
            </h3>
            <div className="flex flex-col w-full">
              {timelineEvents.map((event, i) => (
                <div
                  key={event.label}
                  className={`flex flex-row gap-3 ${i < timelineEvents.length - 1 ? "pb-4" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    {i < timelineEvents.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <LabelValue
                    name={event.label}
                    value={formatDate(event.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          {status === "REQUESTED" ? (
            <Card className="flex flex-col gap-3 items-start">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                Actions
              </h3>
              <PendingActions
                id={id}
                variant={"detail"}
                onSuccess={() => router.push("/collection-requests")}
              />
            </Card>
          ) : status === "APPROVED" ? (
            <Card className="flex flex-col gap-3 items-start">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                Actions
              </h3>
              <ApprovedActions
                id={id}
                variant={"detail"}
                onSuccess={() => router.push("/collection-requests")}
              />
            </Card>
          ) : status === "IN_PROGRESS" ? (
            <Card className="flex flex-col gap-3 items-start">
              <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                Actions
              </h3>
              <InProgressActions
                id={id}
                variant={"detail"}
                onSuccess={() => router.push("/collection-requests")}
                material={req?.material}
                isAssorted={req?.isAssorted}
                categories={categoriesData.categories}
              />
            </Card>
          ) : null}
        </div>
      </PageContent>
    </Page>
  );
}
