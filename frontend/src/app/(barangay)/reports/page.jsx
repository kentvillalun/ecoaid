"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { MrfInventorySection } from "@/components/reports/MrfInventorySection";
import { CollectionIntakeSection } from "@/components/reports/CollectionIntakeSection";
import { RedemptionRewardsSection } from "@/components/reports/RedemptionRewardsSection";
import { ProgramFundsSection } from "@/components/reports/ProgramFundsSection";
import { useRef, useState } from "react";
import { getDefaultDateRange } from "@/components/reports/DateRangePicker";
import Link from "next/link";

export default function ReportsPage() {
  const [mrfDateRange, setMrfDateRange] = useState(getDefaultDateRange())
  const [collectionDateRange, setCollectionDateRange] = useState(getDefaultDateRange())
  const [redemptionDateRange, setRedemptionDateRange] = useState(getDefaultDateRange())
  const [programId, setProgramId] = useState("")
  const [fundsDateRange, setFundsDateRange] = useState(getDefaultDateRange())
  

  const handleExportAll = async () => {
    // TODO: wire up combined Excel export (Material Stock, Collection & Intake,
    // Redemption & Rewards, Program Funds — one workbook, four sheets)

    const response = await fetch("/api/reports/export", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mrfInventory: { startDate: mrfDateRange.startDate, endDate: mrfDateRange.endDate },
        collectionIntake: { startDate: collectionDateRange.startDate, endDate: collectionDateRange.endDate },
        redemption: { startDate: redemptionDateRange.startDate, endDate: redemptionDateRange.endDate, programId },
        programFunds: { startDate: fundsDateRange.startDate, endDate: fundsDateRange.endDate },
      })
    })

    const blob = await response.blob()
    const file = document.createElement("a")

    file.href = URL.createObjectURL(blob)
    file.download = "Operational_Reports.xlsx"
    document.body.appendChild(file)
    file.click()
    document.body.removeChild(file)
    URL.revokeObjectURL(file.href)
  };

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Reports" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Reports"
          subtitle="Generate and export operational reports across the barangay recycling program"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExportAll}
            className="gradient-button text-white new-border px-4 rounded-lg py-2.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer transition-all duration-200 ease-in-out text-nowrap w-full md:w-auto"
          >
            <ArrowDownTrayIcon className="w-4.5 h-4.5" />
            <span className="text-sm md:text-base">Export all</span>
          </button>
         
        </div>

        <MrfInventorySection dateRange={mrfDateRange} setDateRange={setMrfDateRange} />
        <CollectionIntakeSection dateRange={collectionDateRange} setDateRange={setCollectionDateRange} />
        <RedemptionRewardsSection dateRange={redemptionDateRange} setDateRange={setRedemptionDateRange} programId={programId} setProgramId={setProgramId} />
        <ProgramFundsSection dateRange={fundsDateRange} setDateRange={setFundsDateRange} />
      </PageContent>
    </Page>
  );
}
