"use client";

import { ReportPageShell } from "@/components/reports/ReportPageShell";
import { RedemptionRewardsSection } from "@/components/reports/RedemptionRewardsSection";
import { useReportFilters } from "@/components/reports/ReportFiltersContext";

export default function RedemptionRewardsReportPage() {
  const {
    redemptionDateRange: dateRange,
    setRedemptionDateRange: setDateRange,
    programId,
    setProgramId,
  } = useReportFilters();

  return (
    <ReportPageShell
      fileName="Redemption_Rewards_Report.xlsx"
      exportBody={{
        redemption: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          programId,
        },
      }}
    >
      <RedemptionRewardsSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        programId={programId}
        setProgramId={setProgramId}
      />
    </ReportPageShell>
  );
}
