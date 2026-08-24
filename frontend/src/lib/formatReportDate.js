// Report tables show a date only (no time) — the underlying records may carry
// a full timestamp, but the reporting grain here is always "which day".
export const formatReportDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
