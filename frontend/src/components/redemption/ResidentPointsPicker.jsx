"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/lib/formatCurrency";

// A program's balance as the resident sees it: points, or pesos for cash programs
export const formatProgramPoints = (program) =>
  program.isCashMode
    ? formatCurrency(program.points)
    : `${Math.round(program.points * 100) / 100} pts`;

// Bottom sheet that lists the resident's programs with their points and lets
// them choose which one the home screen shows.
export const ResidentPointsPicker = ({
  isOpen,
  onClose,
  programs,
  selectedId,
  onSelect,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <section
      className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full bg-surface rounded-t-2xl p-5 flex flex-col gap-3 max-h-[80%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="font-semibold text-text-primary">Show on home</p>
            <p className="text-xs text-text-secondary">
              Points are counted separately for each program
            </p>
          </div>
          <button type="button" className="hover:cursor-pointer" onClick={onClose}>
            <XMarkIcon className="w-6 stroke-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {programs.map((program) => {
            const isSelected = program.id === selectedId;

            return (
              <button
                key={program.id}
                type="button"
                className="flex flex-row items-center justify-between gap-3 rounded-xl p-3 text-left new-border hover:cursor-pointer"
                style={
                  isSelected
                    ? { border: "1px solid var(--color-accent)" }
                    : undefined
                }
                onClick={() => onSelect(program.id)}
              >
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {program.name}
                  </p>
                  {!program.isActive && (
                    <p className="text-xs text-text-secondary">
                      Ended — points can still be used
                    </p>
                  )}
                </div>
                <div className="flex flex-row items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-text-primary tabular-nums">
                    {formatProgramPoints(program)}
                  </p>
                  {isSelected ? (
                    <CheckIcon className="w-5 stroke-accent" />
                  ) : (
                    <span className="w-5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Link
          href="/programs"
          className="text-sm font-medium text-accent text-center pt-1"
        >
          View all programs
        </Link>
      </div>
    </section>,
    document.body,
  );
};
