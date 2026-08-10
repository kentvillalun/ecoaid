"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

export function AddMaterialModal({
  isOpen,
  onClose,
  setIsModalOpen,
  handleMaterialRefetchCount,
}) {
  const { data } = useFetch({ url: "/api/material/categories/barangay" });
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryError, setCategoryError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [unitError, setUnitError] = useState(null);
  const { makeRequest } = useMutation();

  if (!isOpen) return null;

  const resetModal = () => {
    setCategory("");
    setName("");
    setUnit("");
    setCategoryError(null)
    setNameError(null)
    setUnitError(null)
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!category || category === "") {
      setCategoryError("Category is required");
      hasError = true;
    } else {
      setCategoryError(null);
    }

    if (!name.trim() || name === "") {
      setNameError("Name is required");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!unit || unit === "") {
      setUnitError("Unit is required");
      hasError = true;
    } else {
      setUnitError(null);
    }

    if (hasError)
      return toast.error("Adding material failed. Please try again.");

    toast.loading("Adding material");

    const success = await makeRequest({
      url: "/api/settings/materials",
      body: {
        categoryId: category,
        name,
        defaultUnit: unit,
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Material added successful");
      resetModal();
      handleMaterialRefetchCount();
    } else {
      toast.dismiss();
      toast.error("Adding material failed. Please try again.");
    }
  };

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModal();
      }}
      icon={<CubeIcon className="w-6 stroke-accent" />}
      title="Add Material"
      subtitle="Register a new recyclable material for your barangay"
      confirmLabel="Add Material"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <label htmlFor="materialCategory" className="label">
            Category
          </label>
          <div className="input flex items-center mb-0">
            <select
              id="materialCategory"
              className="w-full outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled hidden>
                Select category
              </option>
              {data?.categories?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {categoryError && (
            <p className="text-error text-xs">{categoryError}</p>
          )}
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="materialName" className="label">
            Material name
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="materialName"
              className="w-full outline-none"
              placeholder="e.g. Aluminum Cans"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {nameError && <p className="text-error text-xs">{nameError}</p>}
        </div>

        {/* Unit */}
        <div className="flex flex-col gap-1">
          <label htmlFor="materialUnit" className="label">
            Default unit
          </label>
          <div className="input flex items-center mb-0">
            <select
              id="materialUnit"
              className="w-full outline-none"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="" disabled hidden>
                Select unit
              </option>
              <option value={"KG"}>kg</option>
              <option value={"LBS"}>lbs</option>
              <option value={"GRAM"}>gram</option>
              <option value={"PIECE"}>pcs</option>
            </select>
          </div>
          {unitError && <p className="text-error text-xs">{unitError}</p>}
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
