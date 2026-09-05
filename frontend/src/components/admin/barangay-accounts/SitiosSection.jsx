"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CheckIcon, MapPinIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Neutral gray — sitios aren't an on/off state like Modules, so they don't
// use the MODULE_STATE_STYLES on/off palette.
const SITIO_PILL_STYLE = { bg: "#f3f4f6", text: "#374151" };

const SitioPill = ({ sitio, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(sitio)}
    className={`text-xs font-medium px-2.5 py-1 rounded-full text-nowrap hover:cursor-pointer border ${
      isSelected ? "border-admin-accent" : "border-transparent"
    }`}
    style={{ backgroundColor: SITIO_PILL_STYLE.bg, color: SITIO_PILL_STYLE.text }}
  >
    {sitio.name}
  </button>
);

export const SitiosSection = ({
  barangayId,
  sitios,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSitio, setSelectedSitio] = useState(null);
  const inputRef = useRef(null);

  const isEditMode = Boolean(selectedSitio);

  const handleSelect = (sitio) => {
    setSelectedSitio(sitio);
    setName(sitio.name);
    setError("");
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setSelectedSitio(null);
    setName("");
    setError("");
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditMode
        ? `/api/admin/sitios/${selectedSitio.id}`
        : `/api/admin/barangays/${barangayId}/sitios`;

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          result?.error ||
            (isEditMode ? "Failed to update sitio" : "Failed to add sitio"),
        );
        setIsSubmitting(false);
        return;
      }

      setName("");
      setSelectedSitio(null);
      setIsSubmitting(false);
      handleRefetchCount();
    } catch (err) {
      setError(isEditMode ? "Failed to update sitio" : "Failed to add sitio");
      setIsSubmitting(false);
    } finally {
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
      <div className="flex flex-row gap-4 items-center border-b border-gray-100 pb-3 w-full">
        <div className="new-border p-3 rounded-xl md:flex items-center hidden bg-white">
          <MapPinIcon className="w-6 stroke-admin-accent" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-base md:text-base text-text-primary">
            Sitios
          </h3>
          <p className="text-xs text-gray-400">
            Sitios registered under this barangay
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 w-full">
        {isLoading && <p className="text-xs text-gray-400">Loading sitios...</p>}
        {isError && (
          <p className="text-xs text-red-400">Unable to load sitios.</p>
        )}
        {!isLoading && !isError && sitios?.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            No sitios registered yet
          </p>
        )}
        {!isLoading &&
          !isError &&
          sitios?.map((sitio) => (
            <SitioPill
              key={sitio.id}
              sitio={sitio}
              isSelected={selectedSitio?.id === sitio.id}
              onSelect={handleSelect}
            />
          ))}
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex flex-row gap-2 w-full items-center">
          <div className="input mb-0 flex flex-row items-center gap-2 flex-1 duration-300 ease-in-out focus-within:outline-admin-accent">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Add a sitio..."
              className="outline-none w-full bg-transparent text-sm"
            />
            {isEditMode && (
              <button
                type="button"
                onClick={handleClear}
                className="hover:cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex md:hidden text-sm font-medium text-admin-accent hover:underline hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline text-nowrap"
          >
            {isEditMode ? "Save" : "Add"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="hidden md:flex flex-row items-center gap-1.5 py-3 px-4 text-sm text-white rounded-lg hover:cursor-pointer gradient-button-admin transition-all duration-200 ease-in-out text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
            {isEditMode ? "Save" : "Add"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <p className="text-xs text-gray-400">Tap a sitio to rename it.</p>
      </div>
    </Card>
  );
};
