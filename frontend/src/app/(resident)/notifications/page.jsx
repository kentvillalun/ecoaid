"use client";

import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { formatDate } from "@/lib/formatDate";
import { getNotificationMessage } from "@/lib/statusStyles";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NotificationsPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/notifications",
    refetchCount,
  });
  const router = useRouter();

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const notifications = data?.notifications;

  return (
    <Page className="bg-bg!">
      <ResidentHeader title={"Notifications"} className="shadow-none! bg-bg!" />
      <PageContent className="md:pl-3! gap-3!">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="flex flex-col items-start gap-2 shadow-none! new-border"
              >
                <div className="flex flex-row items-center justify-between w-full gap-2">
                  <Skeleton width={70} />
                  <Skeleton width={90} />
                </div>
                <Skeleton width={220} />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-full">
            <Error
              subtext={"We couldn't load your notifications"}
              handleRefetchCount={handleRefetchCount}
            />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full">
            <Empty
              text={"No notifications"}
              subtext={"Updates about your pickup requests will show up here"}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications?.map((item) => {
              const materialName = item.pickupRequests
                ? item.pickupRequests.isAssorted
                  ? "Assorted"
                  : item.pickupRequests.material?.name
                : null;
              const isTappable = Boolean(item.pickupRequestId);

              return (
                <Card
                  key={item.id}
                  className={`flex flex-col items-start gap-2 shadow-none! new-border ${
                    !item.isRead ? "bg-accent-light" : ""
                  } ${
                    isTappable
                      ? "transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out"
                      : ""
                  }`}
                  handleClick={
                    isTappable
                      ? () => router.push(`/requests/${item.pickupRequestId}`)
                      : undefined
                  }
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <StatusBadge type={item.type} />
                    <p className="text-xs text-gray-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <p
                    className={`text-sm ${
                      !item.isRead
                        ? "font-semibold text-text-primary"
                        : "text-gray-600"
                    }`}
                  >
                    {getNotificationMessage(item.type, materialName)}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </PageContent>
    </Page>
  );
}
