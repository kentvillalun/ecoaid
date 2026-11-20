"use client";

import { createContext, useContext, useState } from "react";
import { getDefaultDateRange } from "./DateRangePicker";

const ReportFiltersContext = createContext(null);

// Holds every report page's filters in one place. It is mounted once in
// reports/layout.jsx, which stays mounted while you move between report pages,
// so a filter set on one page is still there when you come back and "Export all"
// can use each section's own range.
export const ReportFiltersProvider = ({ children }) => {
  const [mrfDateRange, setMrfDateRange] = useState(getDefaultDateRange);
  const [mrfMaterialId, setMrfMaterialId] = useState("");
  const [collectionDateRange, setCollectionDateRange] = useState(getDefaultDateRange);
  const [redemptionDateRange, setRedemptionDateRange] = useState(getDefaultDateRange);
  const [programId, setProgramId] = useState("");
  const [fundsDateRange, setFundsDateRange] = useState(getDefaultDateRange);

  return (
    <ReportFiltersContext.Provider
      value={{
        mrfDateRange,
        setMrfDateRange,
        mrfMaterialId,
        setMrfMaterialId,
        collectionDateRange,
        setCollectionDateRange,
        redemptionDateRange,
        setRedemptionDateRange,
        programId,
        setProgramId,
        fundsDateRange,
        setFundsDateRange,
      }}
    >
      {children}
    </ReportFiltersContext.Provider>
  );
};

export const useReportFilters = () => {
  const context = useContext(ReportFiltersContext);
  if (!context) {
    throw new Error("useReportFilters must be used inside ReportFiltersProvider");
  }
  return context;
};
