"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { AdminHeaderCard } from "@/components/ui/AdminHeaderCard";

export default function AdminDashboardPage() {
  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Dashboard" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <AdminHeaderCard title="Admin Dashboard" subtitle="Coming soon" />
      </PageContent>
    </Page>
  );
}
