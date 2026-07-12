"use client";

import { useState, useEffect } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { formatDate } from "@/lib/formatDate";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

const TRUNCATE_THRESHOLD = 150;

export default function AnnouncementsPage() {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [refetchCount, setRefetchCount] = useState(0)
  const { data, isLoading, isError} = useFetch({ url: "/api/announcements/residents", refetchCount})

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

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

  const announcements = data?.announcements;

  // Mark announcements as "viewed" once they've loaded successfully.
  // This is what lets the red dot in ResidentHeader know there's nothing new.
  useEffect(() => {
    if (isLoading || isError || !announcements) return;

    localStorage.setItem("lastViewedAnnouncements", new Date().toISOString());

    if (announcements.length > 0) {
      localStorage.setItem("latestAnnouncementDate", announcements[0].createdAt);
    }
  }, [isLoading, isError, announcements]);

  return (
    <Page className="bg-new-bg!">
      <ResidentHeader title={"Announcements"} className="shadow-none! bg-new-bg!" />
      <PageContent className="md:pl-3! gap-3!">
        {isLoading ? (
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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-full">
            <Error
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

                  <p className="font-bold text-text-primary">{item.title}</p>

                  <p
                    className={`text-sm text-gray-600 ${!isExpanded ? "line-clamp-3" : ""}`}
                  >
                    {item.content}
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      className="text-sm font-medium text-cta-color hover:cursor-pointer"
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
      </PageContent>
    </Page>
  );
}
