"use client";

import { ReportPageShell } from "@/components/reports/ReportPageShell";
import { CollectionIntakeSection } from "@/components/reports/CollectionIntakeSection";
import { useReportFilters } from "@/components/reports/ReportFiltersContext";

export default function CollectionIntakeReportPage() {
  const { collectionDateRange: dateRange, setCollectionDateRange: setDateRange } =
    useReportFilters();

  return (
    <ReportPageShell
      fileName="Collection_Intake_Report.xlsx"
      exportBody={{
        collectionIntake: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }}
    >
      <CollectionIntakeSection
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
    </ReportPageShell>
  );
}
