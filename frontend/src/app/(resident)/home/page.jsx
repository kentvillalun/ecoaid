"use client";

import Image from "next/image";
import { TrophyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { Page } from "@/components/layout/Page.jsx";
import { Card } from "@/components/ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  CheckBadgeIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { NotificationBell } from "@/components/navigation/NotificationBell";
import { ResidentRequestCard } from "@/components/requests/ResidentRequestCard";
import { LogoWithName } from "@/components/branding/LogoWithName";

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
    <Page className="bg-bg!">
      <header className="flex flex-row items-start justify-between min-w-full max-h-18.75 bg-bg fixed top-0 p-5 pl-0 z-50">
        <div className="flex flex-row justify-between min-w-full items-center pl-5">
       
          <LogoWithName nameSize="text-4xl" logoSize="max-w-8.5" />

          <NotificationBell />
        </div>
      </header>

      <PageContent className="md:pl-3! gap-3!">
        {/* Greetings */}
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

        {/* Verification warning banner */}
        {data?.user?.isVerified && (
          <Card
            customBorder="0.5px solid var(--color-border)"
            className="shadow-none! flex flex-row items-center gap-3"
          >
            <CheckBadgeIcon className="w-6 stroke-accent shrink-0" />
            <div>
              <p className="text-sm text-dark font-medium">
                Your account isn't verified yet
              </p>
              <p className="text-xs text-text-primary">
                Complete your first pickup to unlock full access
              </p>
            </div>
          </Card>
        )}

        {/* FAQs Banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                customBorder="0.5px solid var(--color-border)"
                className="shadow-none! flex flex-row items-center justify-between"
                handleClick={() => {
                  router.push("/profile/help-support");
                }}
              >
                <div className="">
                  {/* <p className="text-sm text-new-primary font-medium">First time? Watch the tutorial</p> */}
                  <p className="text-sm text-dark font-medium">
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

        {/* Contribution card */}
        <Card
          customBorder="0.5px solid var(--color-border)"
          className="shadow-none! gradient-card relative flex flex-col gap-2 items-start p-4! overflow-clip min-h-42 hover:cursor-pointer"
          handleClick={() => router.push("/standings")}
        >
          <div className="absolute w-30 md:w-35 md:h-35 bg-accent/60 rounded-full h-30 -right-8 -top-8 md:-top-10 md:-right-10"></div>
          <div className="absolute w-25 md:w-35 md:h-35 bg-accent/50 rounded-full h-25 right-18 -bottom-12 md:right-45 md:-bottom-16"></div>
          <div className="flex flex-col gap-1 items-start justify-start w-full">
            <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
              Your Contribution
            </p>
            <p className="text-white font-bold text-4xl md:text-5xl">
              {data?.user?.isVerified ? 0 : 1250}
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.6)]">
              Community contribution
            </p>
          </div>
          <div
            className="text-xs flex flex-row gap-1 items-center justify-start bg-accent/20 px-3 py-1 rounded-xl"
            style={{ border: "0.5px solid var(--color-accent)" }}
          >
            <TrophyIcon className="w-3.5 stroke-accent" />
            <p className="text-accent font-semibold ">
              {data?.user?.isVerified ? "Unranked" : "Rank #3 in your barangay"}
            </p>
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.6)]">
            View standings &gt;
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          {/* Accepted materials card */}
          <Link href={"/community"} className="contents">
            <Card className="flex flex-row items-center gap-3 new-border shadow-none! md:flex-row md:items-center md:gap-3">
              {/* <div className="border p-3 border-none rounded-xl items-center bg-accent-light">
                <ArrowPathIcon className="w-6 stroke-accent" />
              </div> */}
              <ArrowPathIcon className="w-6 stroke-accent shrink-0" />
              <div className="text-xs flex flex-col gap-1">
                <p className="capitalize text-sm text-text-primary font-medium">
                  accepted materials
                </p>
                <div className="flex flex-wrap gap-3">
                  <MaterialTag type={"Plastics"} textOnly={true} />
                  <MaterialTag type={"Papers"} textOnly={true} />
                  <MaterialTag type={"Glass"} textOnly={true} />
                  <MaterialTag type={"Metals"} textOnly={true} />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col gap-2 justify-center">
          <div className="text-base flex flex-row justify-between">
            <p className="font-semibold">Recent Requests</p>
            <Link
              className="flex flex-row text-sm items-center"
              href={"/requests"}
            >
              <p className="font-medium text-accent">View all</p>{" "}
              <ChevronRightIcon className="w-3" />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {requestLoading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <Card
                  className="flex-col! items-start! gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out new-border shadow-none"
                  key={index}
                >
                  {/* Top row */}
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <Skeleton width={155} />
                      <Skeleton width={160} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton width={85} />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
                    <Skeleton width={53} />
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
                <ResidentRequestCard key={r.id} request={r} variant="compact" />
              ))
            )}
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
