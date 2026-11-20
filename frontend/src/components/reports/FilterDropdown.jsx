"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Same button + absolute list pattern as the date and program filters.
// options: [{ value, label }]. value "" means "all" and shows allLabel.
export const FilterDropdown = ({ icon, allLabel, options, value, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef?.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? allLabel;

  const choose = (next) => {
    onChange(next);
    setShowDropdown(false);
  };

  const itemClass = (isSelected) =>
    `px-3.5 py-1.5 w-full hover:cursor-pointer hover:bg-gray-50 ${
      isSelected ? "text-accent font-semibold" : "text-text-secondary"
    }`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border bg-surface text-text-secondary border-border hover:cursor-pointer"
      >
        {icon}
        {selectedLabel}
        <ChevronDownIcon className="w-3.5" />
      </button>
      {showDropdown && (
        <div className="absolute right-0 top-9 z-40 flex max-h-64 w-48 flex-col items-start overflow-y-auto bg-surface rounded-lg new-border text-xs py-2">
          <div onClick={() => choose("")} className={itemClass(!value)}>
            {allLabel}
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => choose(option.value)}
              className={itemClass(value === option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
