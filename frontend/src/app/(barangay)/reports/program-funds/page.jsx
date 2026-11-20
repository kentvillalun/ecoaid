"use client";

import { ReportPageShell } from "@/components/reports/ReportPageShell";
import { ProgramFundsSection } from "@/components/reports/ProgramFundsSection";
import { useReportFilters } from "@/components/reports/ReportFiltersContext";

export default function ProgramFundsReportPage() {
  const { fundsDateRange: dateRange, setFundsDateRange: setDateRange } =
    useReportFilters();

  return (
    <ReportPageShell
      fileName="Program_Funds_Report.xlsx"
      exportBody={{
        programFunds: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }}
    >
      <ProgramFundsSection dateRange={dateRange} setDateRange={setDateRange} />
    </ReportPageShell>
  );
}
