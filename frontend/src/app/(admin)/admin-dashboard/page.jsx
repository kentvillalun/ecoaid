"use client";

import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { AdminHeaderCard } from "@/components/ui/AdminHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IncompleteSetupTable } from "@/components/admin/dashboard/IncompleteSetupTable";
import { IncompleteSetupCard } from "@/components/admin/dashboard/IncompleteSetupCard";
import { useFetch } from "@/hooks/useFetch";
import {
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/admin/onboarding-status",
    refetchCount,
  });
  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  const results = data?.results ?? [];
  const incomplete = results
    .filter(({ barangay }) => barangay.isIncomplete)
    .map(({ barangay }) => barangay);

  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Dashboard" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <AdminHeaderCard
          title="Dashboard"
          subtitle="See which barangays still need setup"
        />

        <Card
          className="shadow-none! gradient-card-admin relative flex flex-row gap-2 items-start p-4! overflow-clip justify-between lg:justify-start lg:gap-25"
        >
          <div className="absolute w-30 md:w-35 md:h-35 bg-admin-accent/60 rounded-full h-30 -right-8 -top-8 md:-top-10 md:-right-10"></div>
          <div className="absolute w-25 md:w-35 md:h-35 bg-admin-accent/50 rounded-full h-25 right-18 -bottom-12 md:right-45 md:-bottom-16"></div>

          <div className="flex flex-col items-start justify-between gap-2 z-40 h-full">
            <div className="flex flex-col gap-1 items-start justify-start w-full">
              <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase">
                Barangays onboarded
              </p>
              <p className="text-white font-bold text-3xl md:text-5xl">
                {isLoading ? "—" : results.length}
              </p>
            </div>
            <div
              className="text-xs flex flex-row gap-1 items-center justify-start bg-admin-accent/20 px-3 py-1 rounded-xl"
              style={{ border: "0.5px solid var(--color-admin-accent)" }}
            >
              <BuildingOffice2Icon className="w-3.5 stroke-admin-accent" />
              <p className="text-admin-accent font-semibold">
                All active accounts
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end lg:items-start justify-start h-full z-40 lg:border-l lg:border-white/10 lg:pl-3">
            <div className="flex flex-col gap-1 items-end lg:items-start justify-start w-full">
              <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium uppercase text-end lg:text-start">
                Need attention
              </p>
              <p className="text-white font-bold text-3xl md:text-5xl">
                {isLoading ? "—" : incomplete.length}
              </p>
            </div>
            <div
              className="text-xs flex flex-row gap-1 items-center justify-start bg-admin-accent/20 px-3 py-1 rounded-xl"
              style={{ border: "0.5px solid var(--color-admin-accent)" }}
            >
              <ExclamationTriangleIcon className="w-3.5 stroke-admin-accent" />
              <p className="text-admin-accent font-semibold">
                Missing staff or sitios
              </p>
            </div>
          </div>
        </Card>

        <SectionHeader
          icon={<ExclamationTriangleIcon className="w-6 stroke-admin-accent" />}
          title="Incomplete setup"
          subtitle="Barangays missing a required staff role or sitio"
          noButton
        />

        <IncompleteSetupTable
          data={incomplete}
          isLoading={isLoading}
          isError={isError}
          handleRefetchCount={handleRefetchCount}
        />
        <IncompleteSetupCard
          data={incomplete}
          isLoading={isLoading}
          isError={isError}
          handleRefetchCount={handleRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
