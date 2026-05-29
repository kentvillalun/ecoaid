"use client";

import { Inter } from "next/font/google";
import Image from "next/image";
import { BellIcon } from "@heroicons/react/24/outline";
import { CameraIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { Page } from "@/components/layout/Page.jsx";
import { Card } from "@/components/ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { MaterialPill } from "@/components/ui/MateriaPill";
import { Pill } from "@/components/ui/Pill";
import { formatDate } from "@/lib/formatDate";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HomePage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/resident/me`;
  const { isLoading, data, isError } = useFetch({ url, refetchCount });
  const router = useRouter();

  const [requestsRefetchCount, setRequestsRefetchCount] = useState(0);
  const requestsUrl = `/api/pickup-requests/my-requests?limit=3`;
  const {
    isLoading: requestLoading,
    isError: requestError,
    data: requestData,
  } = useFetch({ url: requestsUrl, refetchCount: requestsRefetchCount });

  const handleRefetchCount = () => setRequestsRefetchCount((prev) => prev + 1);

  return (
    <Page gradient={true}>
      <header className="flex flex-row items-start justify-between min-w-full max-h-18.75 bg-new-bg fixed top-0 p-5 z-50">
        <div className="flex flex-row justify-between min-w-full ">
          <div className="max-w-40 relative w-full aspect-3/1">
            <Image
              src="/ecoaid-logo/white-logo-wordmark.svg"
              alt="EcoAid logo"
              fill
              priority
            />
          </div>
          <Link href={"/announcements"}>
            <BellIcon className="w-7.25 h-7.25" />
          </Link>
        </div>
      </header>

      <PageContent className="md:pl-3!">
        <div className="flex flex-col items-start">
          {isLoading ? (
            <div>
              <Skeleton width={50} />
              <Skeleton width={300} />
            </div>
          ) : isError ? (
            <div className="">
              <p className="font-medium text-sm"> Hi 👋</p>
              <p className="text-sm">
                Contribute your recyclables to your local barangay
              </p>
            </div>
          ) : (
            <div className="">
              <p className="font-semibold text-lg">
                {" "}
                Hi, {data?.user?.firstName} 👋
              </p>
              <p className="text-sm">
                Contribute your recyclables to {data?.user?.barangay},{" "}
                {data?.user?.municipality}, {data?.user?.province}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Link
            className="bg-[#89D957] min-h-45 min-w-45 flex flex-col items-center justify-start gap-1 pt-7 rounded-full border-2 border-white shadow-gray-400 shadow-lg"
            href={"/capture"}
          >
            <CameraIcon className="h-27 w-27 fill-white" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={"/community"} className="contents">
            <Card className="flex-col items-start gap-2">
              <div className="border p-3 border-none rounded-lg items-center bg-[#89d95720]">
                <CalendarDaysIcon className="w-6 stroke-[#89d957]" />
              </div>
              <div className="text-xs flex flex-col gap-2">
                <p className="uppercase  text-gray-400">ECOAID SCHEDULE</p>
                <div className="">
                  <p className="">Every Sunday</p>
                  <p className=" text-gray-600">8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href={"/community"} className="contents">
            <Card className="flex-col items-start gap-2">
              <div className="border p-3 border-none rounded-lg items-center bg-[#89d95720]">
                <ArrowPathIcon className="w-6 stroke-[#89d957]" />
              </div>
              <div className="text-xs flex flex-col gap-2">
                <p className="uppercase  text-gray-400">accepted materials</p>
                <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
                  <MaterialPill type={"Plastics"} className="px-1! w-15!" />
                  <MaterialPill type={"Papers"} className="px-1! w-15!" />
                  <MaterialPill type={"Bottles"} className="px-1! w-15!" />
                  <MaterialPill type={"Metals"} className="px-1! w-15!" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm flex flex-row justify-between">
            <p className="font-medium ">Recent Requests</p>
            <Link className="flex flex-row " href={"/requests"}>
              <p className="">View all</p>{" "}
              <ChevronRightIcon className="w-4" />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {requestLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out`}
                  key={index}
                >
                  {/* Top row */}
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <Skeleton width={80} />
                      <Skeleton width={130} />
                      <Skeleton width={150} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton width={120} />
                      <Skeleton width={120} />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
                    <Skeleton width={50} />
                  </div>
                </Card>
              ))
            ) : requestError ? (
              <Error
                buttonLabel={"Try again"}
                buttonClassName="py-2! px-6! text-sm!"
                subtext={"We coudn't load your requests"}
                handleRefetchCount={handleRefetchCount}
              />
            ) : requestData?.requests?.length === 0 ? (
              <Empty
                text={"No request yet"}
                subtext={"Tap the camera button to submit your first request"}
              />
            ) : (
              requestData?.requests?.map((r) => (
                <Card
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out`}
                  key={r.id}
                  handleClick={() => router.push(`/requests/${r.id}`)}
                >
                  {/* Top row */}
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-[#1F2937]">
                        {r?.isAssorted ? "Assorted Request" : r?.material?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {r.notes ? r.notes : "No notes available"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Pill type={r.status} />
                      <MaterialPill
                        type={
                          r?.isAssorted === true
                            ? "Assorted"
                            : r?.material?.category?.name
                        }
                      />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Est. {r.estimatedValue}{" "}
                      <span className="lowercase">
                        {r.estimatedUnit === "PIECE" ? "pcs" : r.estimatedUnit}
                      </span>
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
