"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import { useReportFilters } from "./ReportFiltersContext";

// Shared frame for the four report pages: top bar, header, two export buttons
// and the section itself as children.
// - Export: this page's section only. exportBody holds just that section,
//   e.g. { mrfInventory: { startDate, endDate } }.
// - Export all: every section in one workbook, each with its own filters from
//   ReportFiltersContext (so a range set on another report page still applies).
export const ReportPageShell = ({ exportBody, fileName, children }) => {
  const {
    mrfDateRange,
    mrfMaterialId,
    collectionDateRange,
    redemptionDateRange,
    programId,
    fundsDateRange,
  } = useReportFilters();

  // "section" | "all" | null. One state so both buttons are locked while exporting.
  const [exporting, setExporting] = useState(null);
  const isExporting = exporting !== null;

  const datesOf = ({ startDate, endDate }) => ({ startDate, endDate });

  const exportAllBody = {
    mrfInventory: { ...datesOf(mrfDateRange), materialId: mrfMaterialId },
    collectionIntake: datesOf(collectionDateRange),
    redemption: { ...datesOf(redemptionDateRange), programId },
    programFunds: datesOf(fundsDateRange),
  };

  const download = async (kind, body, downloadName) => {
    if (isExporting) return;
    setExporting(kind);

    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 401) return handleUnauthorized();

      if (!response.ok) {
        toast.error("Unable to export this report. Please try again.");
        return;
      }

      const blob = await response.blob();
      const file = document.createElement("a");

      file.href = URL.createObjectURL(blob);
      file.download = downloadName;
      document.body.appendChild(file);
      file.click();
      document.body.removeChild(file);
      URL.revokeObjectURL(file.href);
    } catch (error) {
      toast.error("Unable to export this report. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Reports" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Reports"
          subtitle="Generate and export operational reports across the barangay recycling program"
        />

        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() =>
              download("all", exportAllBody, "Operational_Reports.xlsx")
            }
            disabled={isExporting}
            className="bg-surface text-text-primary new-border px-4 rounded-lg py-2.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer hover:bg-accent/10 transition-all duration-200 ease-in-out text-nowrap w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4.5 h-4.5" />
            <span className="text-sm md:text-base">
              {exporting === "all" ? "Exporting..." : "Export all"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => download("section", exportBody, fileName)}
            disabled={isExporting}
            className="gradient-button text-white new-border px-4 rounded-lg py-2.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer transition-all duration-200 ease-in-out text-nowrap w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4.5 h-4.5" />
            <span className="text-sm md:text-base">
              {exporting === "section" ? "Exporting..." : "Export"}
            </span>
          </button>
        </div>

        {children}
      </PageContent>
    </Page>
  );
};
