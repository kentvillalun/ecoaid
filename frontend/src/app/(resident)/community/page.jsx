"use client";

import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { PageContent } from "@/components/layout/PageContent";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatDate";
import {
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";

const TRUNCATE_THRESHOLD = 150;

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

export default function CommunityPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/resident/barangay-info`;
  const { data, isLoading } = useFetch({ url, refetchCount });
  const [announcementRefetchCount, setAnnouncementRefetchCount] = useState(0);
  const {
    data: latestAnnouncements,
    isLoading: isLatestAnnouncementsLoading,
    isError: isLatestAnnouncementsError,
  } = useFetch({
    url: "/api/announcements/residents/latest",
    refetchCount: announcementRefetchCount,
  });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const {
    data: materials,
    isLoading: isMaterialsLoading,
    isError: isMaterialsError,
  } = useFetch({ url: "/api/material/", refetchCount: materialRefetchCount });

  const { data: userData } = useFetch({ url: "/api/resident/me" });

  const handleRefetchCount = () =>
    setAnnouncementRefetchCount((prev) => prev + 1);

  const handleMaterialsRefetchCount = () =>
    setMaterialRefetchCount((prev) => prev + 1);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const announcements = latestAnnouncements?.latestAnnouncements;

  const categories = [
    ...new Set(materials?.materials?.flatMap((m) => m.category?.name)),
  ];

  return (
    <Page className="bg-bg">
      <ResidentHeader
        title={
          isLoading ? (
            <Skeleton width={200} />
          ) : (
            `${data?.barangay?.name}, ${data?.barangay?.municipality}`
          )
        }
        subtitle={"EcoAid Program"}
        action={"notification"}
        className="shadow-none! bg-bg!"
      />

      <PageContent className="md:pl-3! top-18!">
        <div className="mt-4 flex flex-col gap-3">
          {/* Collection Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Accepted Materials */}
            <Card className="flex gap-2 flex-col items-start new-border shadow-none!">
              <div className="flex flex-row gap-3 items-center ">
                <ArrowPathIcon className="w-6 stroke-accent shrink-0" />
                <div className="text-text-primary">
                  <p className="font-medium text-sm">Accepted Materials</p>
                  <p className="text-xs text-text-secondary">
                    What you can contribute
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 items-start">
                  {isMaterialsLoading ? (
                    <>
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                    </>
                  ) : (
                    !isMaterialsError && (
                      <>
                        <p className="text-xs font-semibold text-accent">
                          Legend:
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {categories?.map((m, i) => (
                            <MaterialTag type={m} key={i} />
                          ))}
                        </div>
                      </>
                    )
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {isMaterialsLoading ? (
                    <>
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                    </>
                  ) : isMaterialsError ? (
                    <div className="text-xs text-gray-400">
                      Unable to get barangay accepted materials.{" "}
                      <button
                        className="text-accent"
                        onClick={() => handleMaterialsRefetchCount()}
                      >
                        Please try again
                      </button>
                    </div>
                  ) : (
                    materials?.materials?.map((m) => (
                      <MaterialTag
                        key={m.id}
                        materialName={m.name}
                        type={m.category?.name}
                      />
                    ))
                  )}
                </div>
                {/* <p className="text-xs text-gray-400 italic">
                  These are general material categories. Feel free to include
                  anything you think can be recycled.
                </p> */}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3 ">
            <div className="text-base flex flex-row justify-between">
              <p className="font-semibold">Annoucements</p>
              <Link
                className="flex flex-row text-sm items-center"
                href={"/updates"}
              >
                <p className="font-medium text-accent">View more</p>{" "}
                <ChevronRightIcon className="w-3" />{" "}
              </Link>
            </div>
            {!userData?.user?.isVerified ? (
              <div className="flex flex-col items-center text-center py-6 gap-1">
                <p className="text-sm text-dark font-medium">
                  Announcements are locked
                </p>
                <p className="text-xs text-text-primary">
                  Complete your first pickup to view barangay announcements
                </p>
              </div>
            ) : isLatestAnnouncementsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 1 }).map((_, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-2 shadow-none! new-border"
                  >
                    <div className="flex flex-row items-center justify-between w-full gap-2">
                      <Skeleton width={70} />
                      <Skeleton width={90} />
                    </div>
                    <Skeleton width={180} />
                    <Skeleton count={2} />
                  </Card>
                ))}
              </div>
            ) : isLatestAnnouncementsError ? (
              <div className="flex flex-col items-center justify-center min-h-full">
                <Error
                  className="pt-0!"
                  subtext={"We couldn't load your announcements"}
                  handleRefetchCount={handleRefetchCount}
                />
              </div>
            ) : announcements?.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full">
                <Empty
                  text={"No announcements"}
                  subtext={"There are no announcements available at the moment"}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {announcements?.map((item) => {
                  const isExpanded = expandedIds.has(item.id);
                  const isLong = item.content.length > TRUNCATE_THRESHOLD;

                  return (
                    <Card
                      key={item.id}
                      className="flex flex-col items-start gap-2 shadow-none! new-border"
                    >
                      <div className="flex flex-row items-center justify-between w-full gap-2">
                        <Badge
                          label={CATEGORY_LABELS[item.category]}
                          color={CATEGORY_COLORS[item.category]}
                        />
                        <p className="text-xs text-gray-400">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <p className="font-bold text-text-primary">
                        {item.title}
                      </p>

                      <p
                        className={`text-sm text-gray-600 ${!isExpanded ? "line-clamp-3" : ""}`}
                      >
                        {item.content}
                      </p>

                      {isLong && (
                        <button
                          type="button"
                          className="text-sm font-medium text-accent hover:cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {isExpanded ? "Read less" : "Read more"}
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Barangay Contact Info */}
          <div className="flex flex-col gap-2">
            <p className="text-base text-text-primary font-semibold">
              Barangay Contact
            </p>
            <Card className="flex-row gap-3 new-border shadow-none">
              <div className="">
                <div className="gradient-button p-4 rounded-full">
                  <BuildingLibraryIcon className="stroke-white w-5 stroke-2" />
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm flex-1">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <p className="font-semibold text-base">
                      {isLoading ? (
                        <Skeleton width={150} />
                      ) : (
                        `Brgy. ${data?.barangay?.name}`
                      )}
                    </p>
                    {isLoading ? (
                      <Skeleton width={50} />
                    ) : (
                      <Badge
                        label={
                          data?.barangay?.isRegistered
                            ? "Registered"
                            : "Unregistered"
                        }
                        color={
                          data?.barangay?.isRegistered
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }
                        className="px-2!"
                      />
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton width={130} />
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {`${data?.barangay?.municipality}, ${data?.barangay?.province}`}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm pb-2">
                    {isLoading ? (
                      <Skeleton width={80} />
                    ) : (
                      data?.barangay?.contactNumber
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
