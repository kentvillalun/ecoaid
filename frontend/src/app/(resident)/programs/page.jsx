"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
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
    <Page className="bg-bg! overflow-hidden">
      <ResidentHeader
        title={"Redemption Programs"}
        className="shadow-none! bg-bg!"
      />
      <PageContent className="md:pl-3! gap-3! md:mt-16!">
        {barangayData && !isDisabled && userData?.user?.isVerified && (
          <Link
            href="/programs/history"
            className="flex flex-row items-center justify-end text-sm"
          >
            <p className="font-medium text-accent">My redemption history</p>
            <ChevronRightIcon className="w-3" />
          </Link>
        )}
        {barangayData && !isDisabled && (
          <ResidentProgramsList isVerified={userData?.user?.isVerified} />
        )}
      </PageContent>
    </Page>
  );
}
