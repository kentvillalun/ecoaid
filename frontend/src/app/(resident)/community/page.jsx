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
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Empty } from "@/components/ui/Empty";

export default function CommunityPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/resident/barangay-info`;
  const { data, isLoading, isError } = useFetch({ url, refetchCount });

  return (
    <Page className="bg-new-bg">
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
        className="shadow-none! bg-new-bg!"
      />

      <PageContent className="md:pl-3! top-18!">
        <div className="mt-4 flex flex-col gap-3">
          {/* Collection Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="flex gap-2 flex-col w-full items-start new-border shadow-none!">
              <div className="flex flex-row gap-3 items-center ">
                <div className="border p-3 border-none rounded-xl items-center bg-[#EAF7E3]">
                  <CalendarDaysIcon className="w-6 stroke-cta-color" />
                </div>
                <div className="text-text-primary">
                  <p className="font-medium text-sm">Collection Schedule</p>
                  <p className="text-xs text-gray-600">
                    Regular Pickup Schedule
                  </p>
                </div>
              </div>
              <div className="flex flex-col text-sm">
                <div className="text-text-primary font-medium text-sm">
                  Every Sunday
                </div>
                <div className="text-gray-600 text-xs">9:00 AM - 12:00 PM</div>
              </div>
            </Card>

            {/* Accepted Materials */}
            <Card className="flex gap-2 flex-col items-start new-border shadow-none!">
              <div className="flex flex-row gap-3 items-center ">
                <div className="border p-3 border-none rounded-xl items-center bg-[#EAF7E3]">
                  <ArrowPathIcon className="w-6 stroke-cta-color" />
                </div>
                <div className="text-text-primary">
                  <p className="font-medium text-sm">Accepted Materials</p>
                  <p className="text-xs text-gray-600">
                    What you can contribute
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  <MaterialTag type={"Plastics"}  />
                  <MaterialTag type={"Papers"}  />
                  <MaterialTag type={"Bottles"}  />
                  <MaterialTag type={"Metals"}  />
                </div>
                <p className="text-xs text-gray-400 italic">
                  These are general material categories. Feel free to include
                  anything you think can be recycled.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <div className="text-base flex flex-row justify-between">
              <p className="font-semibold">Annoucements</p>
              <Link
                className="flex flex-row text-sm items-center"
                href={"/announcements"}
              >
                <p className="font-medium text-cta-color">View more</p>{" "}
                <ChevronRightIcon className="w-3" />{" "}
              </Link>
            </div>
            <div className="">
              <Empty
                subtext={"No announcements available as of the moment."}
                className="min-h-0! p-5!"
              />
            </div>
          </div>

          {/* Barangay Contact Info */}
          <div className="flex flex-col gap-2">
            <p className="text-base text-text-primary font-semibold">
              Barangay Contact
            </p>
            <Card className="flex-row gap-3 new-border shadow-none">
              <div className="">
                <div className="bg-cta-color p-4 rounded-full">
                  <BuildingLibraryIcon className="stroke-white w-5" />
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
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : "bg-[#fee2e2] text-[#b91c1c]"
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
