"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDaysIcon, ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

// Format from the local date parts. toISOString() converts to UTC first, which in
// Manila (UTC+8) turns local midnight into the previous day.
const toISODate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getToday = () => toISODate(new Date());

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  now.setDate(now.getDate() - diffToMonday);
  return toISODate(now);
};

const getStartOfMonth = () => {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const OPTIONS = ["This week", "This month", "Custom range", "Custom date"];

// mode is the dropdown choice. It lives with the dates (not inside the picker)
// so a page that remounts, or the shared report filters, restore both together.
export const getDefaultDateRange = () => ({
  startDate: getStartOfMonth(),
  endDate: getToday(),
  mode: "This month",
});

// Controlled start/end date range. "This week"/"This month" compute the range
// internally (no date inputs shown); "Custom range" reveals start+end inputs;
// "Custom date" reveals a single input and mirrors it into both start and end.
export const DateRangePicker = ({
  startDate,
  endDate,
  mode = "This month",
  onChange,
}) => {
  const selected = mode;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef?.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (option) => {
    setShowDropdown(false);

    if (option === "This week") {
      onChange({ startDate: getStartOfWeek(), endDate: getToday(), mode: option });
    } else if (option === "This month") {
      onChange({ startDate: getStartOfMonth(), endDate: getToday(), mode: option });
    } else if (option === "Custom date") {
      const today = getToday();
      onChange({ startDate: today, endDate: today, mode: option });
    } else {
      // Custom range keeps whatever start/end is already set and just reveals the inputs.
      onChange({ startDate, endDate, mode: option });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex flex-row text-gray-600 text-sm items-center justify-start gap-1">
        <FunnelIcon className="w-4" />
        <p>Filter:</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border hover:cursor-pointer"
        >
          <CalendarDaysIcon className="w-4" />
          {selected}
          <ChevronDownIcon className="w-3.5" />
        </button>
        {showDropdown && (
          <div className="absolute left-0 top-9 z-40 flex flex-col items-start w-36 bg-surface rounded-lg new-border text-xs py-2">
            {OPTIONS.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
                  selected === option
                    ? "text-accent font-semibold"
                    : "text-text-secondary"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected === "Custom range" && (
        <div className="flex flex-row items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => onChange({ startDate: e.target.value, endDate, mode })}
            className="text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border outline-none hover:cursor-pointer"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={getToday()}
            onChange={(e) => onChange({ startDate, endDate: e.target.value, mode })}
            className="text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border outline-none hover:cursor-pointer"
          />
        </div>
      )}

      {selected === "Custom date" && (
        <input
          type="date"
          value={startDate}
          max={getToday()}
          onChange={(e) => onChange({ startDate: e.target.value, endDate: e.target.value, mode })}
          className="text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border outline-none hover:cursor-pointer"
        />
      )}
    </div>
  );
};
