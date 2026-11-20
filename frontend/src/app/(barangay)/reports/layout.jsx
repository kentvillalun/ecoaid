import { ReportFiltersProvider } from "@/components/reports/ReportFiltersContext";

// Stays mounted across the four report pages, so their filters are kept.
export default function ReportsLayout({ children }) {
  return <ReportFiltersProvider>{children}</ReportFiltersProvider>;
}
