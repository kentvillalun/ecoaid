"use client";


import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { JunkshopSection } from "@/components/settings/JunkshopSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { MaterialsSection } from "@/components/settings/MaterialsSection";



export default function SettingsPage() {
 

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Settings" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Settings"
          subtitle="Manage your barangay's EcoAid configuration"
        />

        {/* Junkshops */}
        <JunkshopSection />

        {/* Materials */}
        <MaterialsSection />

        {/* Theme settings */}
        <AppearanceSection />

        
      </PageContent>
    </Page>
  );
}
