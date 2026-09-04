"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { AdminHeaderCard } from "@/components/ui/AdminHeaderCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BarangayTable } from "@/components/admin/barangay-accounts/BarangayTable";
import { BarangayCard } from "@/components/admin/barangay-accounts/BarangayCard";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";


export default function BarangayAccountsPage() {
  const [refetchCount, setRefetchCount] = useState(0)
  const { data: barangaysData, isLoading, isError, error } = useFetch({ url: "/api/admin/barangays", refetchCount})

  const handleRefetchCount = () => setRefetchCount(prev => prev + 1)
  const router = useRouter()
  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Barangays" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <AdminHeaderCard
          title="Barangays"
          subtitle="Manage registered barangays on the platform"
        />

        <SectionHeader
          title="Barangays"
          subtitle="Manage registered barangays."
          icon={<BuildingOffice2Icon className="w-6 stroke-admin-accent" />}
          buttonLabel="Register barangay"
          onAction={() => router.push("/barangay-accounts/register")}
        />

        <BarangayTable
          data={barangaysData?.barangays}
          isLoading={isLoading}
          isError={isError}
          error={error}
          handleRefetchCount={handleRefetchCount}
        />
        <BarangayCard
          data={barangaysData?.barangays}
          isLoading={isLoading}
          isError={isError}
          error={error}
          handleRefetchCount={handleRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
