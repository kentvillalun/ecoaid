"use client";

import { Card } from "@/components/ui/Card";
import { AdminInput } from "@/components/ui/AdminInput";
import { AdminLabel } from "@/components/ui/AdminLabel";
import { THEMES } from "@/lib/themes";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MODULE_LABELS = [
  { key: "hasCollectionRequests", label: "Collection Requests" },
  { key: "hasRedemptionManagement", label: "Redemption Management" },
  { key: "hasRewardInventory", label: "Reward Inventory" },
  { key: "hasLeaderboard", label: "Leaderboard" },
];

const CardHeader = ({ title, subtitle }) => (
  <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 w-full">
    <h3 className="font-semibold text-base md:text-base text-text-primary">
      {title}
    </h3>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

const ModuleToggleRow = ({ label, isLast, checked, onToggle }) => (
  <div
    className={`flex flex-row items-center justify-between py-3 w-full ${isLast ? "" : "border-b border-gray-100"}`}
    onClick={onToggle}
    role="switch"
    aria-checked={checked}
    type="button"
  >
    <p className="text-sm text-text-primary">{label}</p>
    <div
      className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${checked ? "gradient-button-admin" : "bg-gray-200"}`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all ${checked ? "left-5" : "left-0.5"}`}
      />
    </div>
  </div>
);

const schema = yup.object().shape({
  name: yup.string().required("Barangay name is required"),
  municipality: yup.string().required("Municipality is required"),
  province: yup.string().required("Province is required"),
  zipCode: yup
    .string()
    .matches(/^\d{4}$/, "Enter a valid 4-digit zip code")
    .required("Zip code is required"),
  contactNumber: yup
    .string()
    .matches(/^09\d{9}$/, "Enter a valid 11-digit contact number")
    .required("Contact number is required"),
  themeAccent: yup
    .string()
    .oneOf(
      [
        "FOREST_GREEN",
        "OCEAN_TEAL",
        "SUNRISE_ORANGE",
        "ROYAL_PURPLE",
        "DEEP_MAROON",
        "EARTH_BROWN",
        "SUNFLOWER_GOLD",
      ],
      "Choose a valid theme",
    )
    .required("Theme is required"),
  hasCollectionRequests: yup.boolean(),
  hasRedemptionManagement: yup.boolean(),
  hasRewardInventory: yup.boolean(),
  hasLeaderboard: yup.boolean(),
});

export function BarangayForm({
  defaultValues,
  defaultModules,
  onSubmit,
  submitLabel,
  isLoading,
}) {
  const [modules, setModules] = useState({
    hasCollectionRequests: false,
    hasRedemptionManagement: false,
    hasRewardInventory: false,
    hasLeaderboard: false,
    ...defaultModules,
  });
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      municipality: "",
      province: "",
      zipCode: "",
      contactNumber: "",
      themeAccent: "",
      ...defaultValues,
    },
  });

  const toggleModule = (key) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, ...modules });
  };

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* Basic information */}
      <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
        <CardHeader
          title="Basic Information"
          subtitle="Core details about the barangay"
        />

        <div className="flex flex-col gap-1.5 w-full">
          <AdminLabel htmlFor="barangayName">Barangay name</AdminLabel>
          <AdminInput
            id="barangayName"
            type="text"
            placeholder="Enter barangay name"
            {...register("name")}
          />
          {errors?.name && (
            <p className="text-xs text-red-400 text-start">
              {errors?.name?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="municipality">Municipality</AdminLabel>
            <AdminInput
              id="municipality"
              type="text"
              placeholder="Enter municipality"
              {...register("municipality")}
            />
            {errors?.municipality && (
              <p className="text-xs text-red-400 text-start">
                {errors?.municipality?.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="province">Province</AdminLabel>
            <AdminInput
              id="province"
              type="text"
              placeholder="Enter province"
              {...register("province")}
            />
            {errors?.province && (
              <p className="text-xs text-red-400 text-start">
                {errors?.province?.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="zipCode">Zip code</AdminLabel>
            <AdminInput
              id="zipCode"
              type="text"
              placeholder="Enter zip code"
              {...register("zipCode")}
            />
            {errors?.zipCode && (
              <p className="text-xs text-red-400 text-start">
                {errors?.zipCode?.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="contactNumber">Contact number</AdminLabel>
            <AdminInput
              id="contactNumber"
              type="text"
              placeholder="Enter contact number"
              {...register("contactNumber")}
            />
            {errors?.contactNumber && (
              <p className="text-xs text-red-400 text-start">
                {errors?.contactNumber?.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Theme and Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="flex flex-col items-start gap-4 shadow-none! new-border">
          <CardHeader
            title="Theme"
            subtitle="Choose a color theme for this barangay"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <AdminLabel htmlFor="themeAccent">Theme preset</AdminLabel>
            <div className="input mb-0 focus-within:outline-admin-accent">
              <select
                id="themeAccent"
                className="w-full outline-none bg-transparent"
                defaultValue={defaultValues?.themeAccent ?? ""}
                {...register("themeAccent")}
              >
                <option value="" disabled hidden>
                  Select a theme
                </option>
                {Object.entries(THEMES).map(([key, theme]) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            {errors?.themeAccent && (
              <p className="text-xs text-red-400 text-start">
                {errors?.themeAccent?.message}
              </p>
            )}
          </div>
        </Card>

        <Card className="flex flex-col items-start gap-1 shadow-none! new-border">
          <CardHeader
            title="Modules"
            subtitle="Enable the modules this barangay will use"
          />

          <div className="flex flex-col w-full">
            {MODULE_LABELS.map((module, index) => (
              <ModuleToggleRow
                key={module.key}
                label={module.label}
                isLast={index === MODULE_LABELS.length - 1}
                checked={modules[module.key]}
                onToggle={() => toggleModule(module.key)}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="flex flex-col shadow-none! new-border">
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            className="py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:cursor-pointer"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button-admin transition-all duration-200 ease-in-out"
            disabled={isLoading}
          >
            {submitLabel}
          </button>
        </div>
      </Card>
    </form>
  );
}
