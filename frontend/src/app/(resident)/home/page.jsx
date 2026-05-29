"use client";

import Image from "next/image";
import { BellIcon, TrophyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CameraIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { Page } from "@/components/layout/Page.jsx";
import { Card } from "@/components/ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { useEffect, useState } from "react";
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
import { AnimatePresence, motion } from "motion/react";

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

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(!localStorage.getItem("dismissedTutorialBanner"));
  });

  const handleDismiss = () => {
    localStorage.setItem("dismissedTutorialBanner", "true");
    setShowBanner(false);
  };

  return (
    <Page className="bg-new-bg!">
      <header className="flex flex-row items-start justify-between min-w-full max-h-18.75 bg-new-bg fixed top-0 p-5 pl-0 z-50">
        <div className="flex flex-row justify-between min-w-full items-center">
          <div className="max-w-35 relative w-full aspect-4/1">
            <Image
              src="/ecoaid-logo/logo-wordmark.svg"
              alt="EcoAid logo"
              fill
              priority
              loading={"eager"}
            />
          </div>
          {/* <Link href={"/announcements"} className="bg-white rounded-full p-2" style={{ border: "0.5px solid #e5e7eb"}}>
            <BellIcon className="w-5 h-5" />
          </Link> */}
        </div>
      </header>

      <PageContent className="md:pl-3! gap-3!">
        <div className="flex flex-col items-start">
          {isLoading ? (
            <div>
              <Skeleton width={50} />
              <Skeleton width={300} />
            </div>
          ) : isError ? (
            <div className="">
              <p className="font-bold text-xl text-text-primary"> Hi 👋</p>
              <p className="text-sm">
                Contribute your recyclables to your local barangay
              </p>
            </div>
          ) : (
            <div className="">
              <p className="font-bold text-xl text-text-primary">
                {" "}
                Hi, {data?.user?.firstName} 👋
              </p>
              <p className="text-sm">
                {data?.user?.barangay}, {data?.user?.municipality},{" "}
                {data?.user?.province}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                customBorder="0.5px solid #e5e7eb"
                className="shadow-none! flex flex-row items-center justify-between"
                handleClick={() => {
                  router.push("/profile/help-support");
                }}
              >
                <div className="">
                  {/* <p className="text-sm text-new-primary font-medium">First time? Watch the tutorial</p> */}
                  <p className="text-sm text-new-primary font-medium">
                    New to EcoAid? Visit our FAQ
                  </p>
                  <p className="text-xs text-text-primary">
                    Learn how to submit a pickup request →
                  </p>
                </div>
                <button
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                >
                  <XMarkIcon className="w-5 stroke-gray-600" />
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card
          customBorder="0.5px solid #e5e7eb"
          className="shadow-none! bg-new-primary! relative flex flex-col gap-2 items-start p-4! overflow-clip"
        >
          <div className="absolute w-30 md:w-35 md:h-35 bg-cta-color/60 rounded-full h-30 -right-8 -top-8 md:-top-10 md:-right-10"></div>
          <div className="absolute w-25 md:w-35 md:h-35 bg-cta-color/50 rounded-full h-25 right-18 -bottom-12 md:right-45 md:-bottom-16"></div>
          <div className="flex flex-col gap-1 items-start justify-start w-full">
            <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
              Your Points
            </p>
            <p className="text-white font-bold text-4xl md:text-5xl">1,250</p>
            <p className="text-xs text-[rgba(255,255,255,0.6)]">
              Community contribution points
            </p>
          </div>
          <div
            className="text-xs flex flex-row gap-1 items-center justify-start bg-primary/20 px-3 py-1 rounded-xl"
            style={{ border: "0.5px solid #49b02d" }}
          >
            <TrophyIcon className="w-3.5 stroke-primary" />
            <p className="text-primary font-semibold ">
              Rank #3 in your barangay
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link href={"/community"} className="contents">
            <Card className="flex-col items-start gap-2 new-border shadow-none md:flex-row md:items-center md:gap-3">
              <div className="border p-3 border-none rounded-xl items-center bg-[#EAF7E3]">
                <CalendarDaysIcon className="w-6 stroke-cta-color" />
              </div>
              <div className="text-xs flex flex-col gap-1">
                <p className="uppercase  text-gray-400 font-medium">EcoAid Collection</p>
                <div className="text-text-primary font-medium text-sm">
                  <p className="">Every Sunday</p>
                  <p className=" ">8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href={"/community"} className="contents">
            <Card className="flex-col items-start gap-2 new-border shadow-none! md:flex-row md:items-center md:gap-3">
              <div className="border p-3 border-none rounded-xl items-center bg-[#EAF7E3]">
                <ArrowPathIcon className="w-6 stroke-cta-color" />
              </div>
              <div className="text-xs flex flex-col gap-1">
                <p className="uppercase  text-gray-400 font-medium">accepted materials</p>
                <div className="flex flex-wrap gap-1">
                  <MaterialPill type={"Plastics"} className="px-1!  w-auto min-w-16" />
                  <MaterialPill type={"Papers"} className="px-1! w-auto min-w-16" />
                  <MaterialPill type={"Bottles"} className="px-1! w-auto min-w-16" />
                  <MaterialPill type={"Metals"} className="px-1! w-auto min-w-16" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col gap-2 justify-center">
          <div className="text-base flex flex-row justify-between">
            <p className="font-semibold">Recent Requests</p>
            <Link className="flex flex-row text-sm items-center" href={"/requests"}>
              <p className="font-medium text-cta-color">View all</p>{" "}
              <ChevronRightIcon className="w-3" />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {requestLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out new-border shadow-none`}
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
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out new-border shadow-none`}
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
