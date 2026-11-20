"use client";

import { ReportPageShell } from "@/components/reports/ReportPageShell";
import { MrfInventorySection } from "@/components/reports/MrfInventorySection";
import { useReportFilters } from "@/components/reports/ReportFiltersContext";

export default function MaterialInventoryReportPage() {
  const {
    mrfDateRange: dateRange,
    setMrfDateRange: setDateRange,
    mrfMaterialId: materialId,
    setMrfMaterialId: setMaterialId,
  } = useReportFilters();

  return (
    <ReportPageShell
      fileName="Material_Inventory_Report.xlsx"
      exportBody={{
        mrfInventory: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          materialId,
        },
      }}
    >
      <MrfInventorySection
        dateRange={dateRange}
        setDateRange={setDateRange}
        materialId={materialId}
        setMaterialId={setMaterialId}
      />
    </ReportPageShell>
  );
}
