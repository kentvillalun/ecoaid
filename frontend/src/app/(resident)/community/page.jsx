"use client";

import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { PageContent } from "@/components/layout/PageContent";
import { Inter } from "next/font/google";
import Image from "next/image";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { MaterialPill } from "@/components/ui/MateriaPill";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Badge } from "@/components/ui/Badge";
import { SitioPill } from "@/components/ui/SitioPill";

export default function CommunityPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/resident/barangay-info`;
  const { data, isLoading, isError } = useFetch({ url, refetchCount });

  return (
    <Page gradient={true}>
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
      />

      <PageContent>
        <div className="mt-4 flex flex-col gap-4">
          {/* Collection Schedule */}
          <Card className="flex gap-6 flex-row">
            <div className="w-auto">
              <Image
                src={"/calendar.svg"}
                width={52}
                height={52}
                alt="Calendar"
              />
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium">EcoAid Collection Schedule</p>
              <div className="">
                <div className="text-[#727272]">Every Sunday</div>
                <div className="text-gray-400">9:00 AM - 12:00 PM</div>
              </div>
            </div>
          </Card>

          {/* Accepted Materials */}
          <Card className="flex gap-6 flex-row">
            <div className="flex flex-col gap-3 text-sm">
              <p className="font-medium">Accepted Materials</p>
              <div className="flex flex-col gap-2">
                <div className="grid gap-1 grid-cols-4">
                  <MaterialPill type={"Plastics"} className="px-1! w-auto!" />
                  <MaterialPill type={"Papers"} className="px-1! w-auto!" />
                  <MaterialPill type={"Bottles"} className="px-1! w-auto!" />
                  <MaterialPill type={"Metals"} className="px-1! w-auto!" />
                </div>
                <p className="text-xs text-gray-400 italic">
                  These are general material categories. Feel free to include
                  anything you think can be recycled.
                </p>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="flex flex-col items-start gap-1 text-sm! justify-start w-full">
            <p className="font-medium">How it Works</p>
            <div className="flex flex-col gap-2 items-start">
              <div className="flex flex-row items-center gap-4">
                <div className="text-primary border-2 rounded-full min-h-8 min-w-8 text-center text-lg align font-medium">
                  1
                </div>
                <p className="text-gray-400 text-sm">
                  Post your recyclables using the camera button.
                </p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="text-primary border-2 rounded-full min-h-8 min-w-8 text-center text-lg align font-medium">
                  2
                </div>
                <p className="text-gray-400 text-sm">
                  Barangay reviews, approves, and picks up your materials.
                </p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="text-primary border-2 rounded-full min-h-8 min-w-8 text-center text-lg align font-medium">
                  3
                </div>
                <p className="text-gray-400 text-sm">
                  Earn rewards through your barangay's redemption program.
                </p>
              </div>
            </div>
          </Card>

          {/* Barangay Contact Info */}
          <Card className="flex-row gap-6">
            <div className="">
              <Image
                src={"/contact.svg"}
                width={52}
                height={52}
                alt="Calendar"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium">Barangay Information</p>
              <div className="flex flex-col">
                <div className="flex flex-row gap-2 items-center justify-between w-full">
                  <p className="">
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
                  <p className="text-gray-400 text-sm">
                    {`${data?.barangay?.municipality}, ${data?.barangay?.province}`}
                  </p>
                )}
                <p className="text-gray-400 text-sm pb-2">
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
      </PageContent>
    </Page>
  );
}
