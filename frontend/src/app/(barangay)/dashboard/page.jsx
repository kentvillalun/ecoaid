"use client";

import { Page } from "@/components/layout/Page";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { IconContainer } from "@/components/ui/IconContainer";
import {
  Bars3Icon,
  WalletIcon as WalletOutline,
  ArrowUpRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconOutline,
} from "@heroicons/react/24/outline";
import {
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { useFetch } from "@/hooks/useFetch";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Error } from "@/components/ui/Error";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useRouter } from "next/navigation";
import { RecentTransactionTable } from "@/components/dashboard/RecentTransactionTable";
import { RecentTransactionCard } from "@/components/dashboard/RecentTransactionCard";

export default function BarangayDashboardPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/dashboard/`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });
  const router = useRouter();

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const [transactionRefetchCount, setTransactionRefetchCount] = useState(0);
  const transactionUrl = `/api/dashboard/recent-transactions`;
  const {
    isLoading: transactionLoading,
    isError: transactionError,
    data: transactionData,
  } = useFetch({ url: transactionUrl, refetchCount: transactionRefetchCount });

  const handleTransactionRefetchCount = () =>
    setTransactionRefetchCount((prev) => prev + 1);

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title="Dashboard" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title={"Dashboard"}
          subtitle={"Barangay Recycling Overview"}
        />

        {isLoading ? (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card
              customBorder="0.5px solid #e5e7eb"
              className="shadow-none! gradient-card relative flex flex-row gap-2 items-start p-4! overflow-clip col-span-2 lg:col-span-4 lg:justify-start justify-between lg:gap-25"
            >
              <div className="absolute w-30 md:w-35 md:h-35 bg-cta-color/60 rounded-full h-30 -right-8 -top-8 md:-top-10 md:-right-10"></div>
              <div className="absolute w-25 md:w-35 md:h-35 bg-cta-color/50 rounded-full h-25 right-18 -bottom-12 md:right-45 md:-bottom-16"></div>
              <div className="flex flex-col items-start justify-between gap-2  z-50">
                <div className="flex flex-col gap-1 items-start justify-start w-full">
                  <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
                    Total Recyclables Collected
                  </p>
                  <Skeleton width={158} height={46}/>
                  <p className="text-xs text-[rgba(255,255,255,0.6)]">
                    Across all collection sources
                  </p>
                </div>
                <div
                  className="text-xs flex flex-row gap-1 items-center justify-start bg-primary/20 px-3 py-1 rounded-xl"
                  style={{ border: "0.5px solid #49b02d" }}
                >
                  <ArrowTrendingUpIcon className="w-3.5 stroke-primary" />
                  <p className="text-primary font-semibold ">All time total</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end lg:items-start justify-start h-full z-50 lg:border-l lg:border-white/10 lg:pl-3">
                <div className="flex flex-col gap-1 items-end lg:items-start justify-start w-full">
                  <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
                    Current Fund Balance
                  </p>
                  <Skeleton width={157} height={46}/>
                  <p className="text-xs text-[rgba(255,255,255,0.6)]">
                    Available program funds
                  </p>
                </div>
                <div
                  className="text-xs flex flex-row gap-1 items-center justify-start bg-primary/20 px-3 py-1 rounded-xl"
                  style={{ border: "0.5px solid #49b02d" }}
                >
                  <WalletOutline className="w-3.5 stroke-primary" />
                  <p className="text-primary font-semibold ">Available funds</p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280] flex-1">
                  Pending requests
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <Skeleton width={100}/>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ClockIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Awaiting approval</p>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Intake transactions
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <Skeleton width={100}/>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ClipboardDocumentCheckIconOutline className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Recorded entries</p>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Unverified residents
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <Skeleton width={100}/>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ExclamationCircleIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">
                  Pending verification
                </p>
              </div>
            </Card>
            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Program expenses
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <Skeleton width={100}/>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ReceiptPercentIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Cumulative total</p>
              </div>
            </Card>
          </section>
        ) : isError ? (
          <Error
            subtext={"We coudn't get your dashboard data"}
            handleRefetchCount={handleRefetchCount}
          />
        ) : (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card
              customBorder="0.5px solid #e5e7eb"
              className="shadow-none! gradient-card relative flex flex-row gap-2 items-start p-4! overflow-clip col-span-2 lg:col-span-4 lg:justify-start justify-between lg:gap-25"
            >
              <div className="absolute w-30 md:w-35 md:h-35 bg-cta-color/60 rounded-full h-30 -right-8 -top-8 md:-top-10 md:-right-10"></div>
              <div className="absolute w-25 md:w-35 md:h-35 bg-cta-color/50 rounded-full h-25 right-18 -bottom-12 md:right-45 md:-bottom-16"></div>
              <div className="flex flex-col items-start justify-between gap-2  z-40">
                <div className="flex flex-col gap-1 items-start justify-start w-full">
                  <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
                    Total Recyclables Collected
                  </p>
                  <p className="text-white font-bold text-4xl md:text-5xl">
                    1,250 kg
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.6)]">
                    Across all collection sources
                  </p>
                </div>
                <div
                  className="text-xs flex flex-row gap-1 items-center justify-start bg-primary/20 px-3 py-1 rounded-xl"
                  style={{ border: "0.5px solid #49b02d" }}
                >
                  <ArrowTrendingUpIcon className="w-3.5 stroke-primary" />
                  <p className="text-primary font-semibold ">All time total</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end lg:items-start justify-start h-full z-40 lg:border-l lg:border-white/10 lg:pl-3">
                <div className="flex flex-col gap-1 items-end lg:items-start justify-start w-full">
                  <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
                    Current Fund Balance
                  </p>
                  <p className="text-white font-bold text-4xl md:text-5xl">
                    ₱ 17,500
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.6)]">
                    Available program funds
                  </p>
                </div>
                <div
                  className="text-xs flex flex-row gap-1 items-center justify-start bg-primary/20 px-3 py-1 rounded-xl"
                  style={{ border: "0.5px solid #49b02d" }}
                >
                  <WalletOutline className="w-3.5 stroke-primary" />
                  <p className="text-primary font-semibold ">Available funds</p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280] flex-1">
                  Pending requests
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                {data?.requestedCount}
              </p>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ClockIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Awaiting approval</p>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Intake transactions
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                {data?.totalRecords}
              </p>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ClipboardDocumentCheckIconOutline className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Recorded entries</p>
              </div>
            </Card>

            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Unverified residents
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                {data?.unverified}
              </p>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ExclamationCircleIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">
                  Pending verification
                </p>
              </div>
            </Card>
            <Card className="shadow-none! new-border flex flex-col items-start">
              <div className="flex flex-row items-start justify-between w-full">
                <p className="text-xs font-medium text-[#6b7280]">
                  Program expenses
                </p>
                <IconContainer
                  icon={<ArrowUpRightIcon className="w-3 stroke-[#6b7280]" />}
                  className="rounded-full! p-2!"
                  containerColor={"#f3f4f6"}
                />
              </div>
              <p className="md:text-2xl font-bold text-text-primary text-lg">
                ₱ 43,500
              </p>
              <div className="flex flex-row items-center w-auto bg-primary/10 px-3 py-1 rounded-xl text-xs gap-1">
                <ReceiptPercentIcon className="w-3 stroke-cta-color" />
                <p className="text-cta-color font-medium">Cumulative total</p>
              </div>
            </Card>
          </section>
        )}
        <section className="flex flex-col gap-6">
          <SectionHeader
            icon={<Bars3Icon className="w-6 stroke-cta-color" />}
            title={"Recent Intake Transactions"}
            subtitle={"Latest recorded material intake entries"}
            buttonIcon={""}
            buttonLabel={"View all ->"}
            onAction={() => router.push("/collection-requests")}
          />

          <RecentTransactionTable
            data={transactionData}
            isError={transactionError}
            isLoading={transactionLoading}
            handleRefetchCount={handleTransactionRefetchCount}
          />

          <div className="md:hidden flex flex-col gap-2">
            <RecentTransactionCard
              data={transactionData}
              isError={transactionError}
              isLoading={transactionLoading}
              handleRefetchCount={handleTransactionRefetchCount}
            />
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
