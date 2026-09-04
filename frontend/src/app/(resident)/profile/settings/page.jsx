"use client";

import { Page } from "@/components/layout/Page.jsx";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { ResidentHeader } from "@/components/navigation/ResidentHeader.jsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <Page className="bg-bg!">
      <ResidentHeader title={"Settings"} className="shadow-none bg-bg!" />

      <PageContent>
        <div className="">
          <div className="font-medium py-3 border-b border-border text-sm">
            <h2 className="uppercase text-xs text-gray-400">General</h2>
          </div>

          <Link href={"/profile/settings/terms"}>
            <div className="py-6 border-b border-border flex flex-row gap-2 items-center justify-between">
              <h2 className="font-medium text-sm">Terms & Privacy</h2>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>
      </PageContent>
    </Page>
  );
}
