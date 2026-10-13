"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { ResidentProgramsList } from "@/components/redemption/ResidentProgramsSection";
import { useFetch } from "@/hooks/useFetch";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProgramsPage() {
  const router = useRouter();
  const { data: barangayData } = useFetch({
    url: "/api/resident/barangay-info",
  });
  const { data: userData } = useFetch({ url: "/api/resident/me" });

  const isDisabled =
    barangayData && !barangayData?.barangay?.hasRedemptionManagement;

  // barangays without redemption management never see this page,
  // even when the URL is typed directly
  useEffect(() => {
    if (isDisabled) router.replace("/community");
  }, [isDisabled, router]);

  return (
    <Page className="bg-bg!">
      <ResidentHeader
        title={"Redemption Programs"}
        className="shadow-none! bg-bg!"
      />
      <PageContent className="md:pl-3! gap-3!">
        {barangayData && !isDisabled && (
          <ResidentProgramsList isVerified={userData?.user?.isVerified} />
        )}
      </PageContent>
    </Page>
  );
}
