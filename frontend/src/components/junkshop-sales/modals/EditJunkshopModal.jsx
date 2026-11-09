"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { BuildingStorefrontIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export function EditJunkshopModal({
  junkshopId,
  onClose,
  handleRefetchCount,
}) {
  const { data, isError } = useFetch({
    url: `/api/junkshop-sales/junkshop/${junkshopId}`,
  });
  const { data: materialData } = useFetch({ url: "/api/material/barangay" });

  // the form starts from the saved junkshop, so wait until it is loaded
  if (!data?.junkshop) {
    return createPortal(
      <Modal
        isOpen={true}
        onClose={onClose}
        icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
        title="Edit Junkshop"
        subtitle="Update this junkshop partner and its price listing"
        confirmLabel="Close"
        confirmClassName="gradient-button"
        onConfirm={onClose}
      >
        <div className="p-6 flex justify-center">
          {isError ? (
            <p className="text-sm text-gray-500">
              Unable to load this junkshop. Please try again.
            </p>
          ) : (
            <Spinner />
          )}
        </div>
      </Modal>,
      document.body,
    );
  }

  return (
    <EditJunkshopForm
      junkshopId={junkshopId}
      junkshop={data.junkshop}
      materials={materialData?.materials ?? []}
      onClose={onClose}
      handleRefetchCount={handleRefetchCount}
    />
  );
}

function EditJunkshopForm({
  junkshopId,
  junkshop,
  materials,
  onClose,
  handleRefetchCount,
}) {
  const [name, setName] = useState(junkshop.name ?? "");
  const [description, setDescription] = useState(junkshop.description ?? "");
  const [location, setLocation] = useState(junkshop.location ?? "");
  const [isAvailable, setIsAvailable] = useState(junkshop.isAvailable);
  const [priceItems, setPriceItems] = useState(
    junkshop.priceItems.map((item) => ({
      materialId: item.material.id,
      price: String(item.price),
      unit: item.unit,
    })),
  );
  const [nameError, setNameError] = useState(null);
  const [priceItemError, setPriceItemError] = useState(null);
  const { makeRequest, errorMessageRef } = useMutation();

  const addPriceItem = () =>
    setPriceItems((prev) => [...prev, { materialId: "", price: "", unit: "KG" }]);

  const removePriceItem = (index) =>
    setPriceItems((prev) => prev.filter((_, i) => i !== index));

  const updatePriceItem = (index, field, value) => {
    const updated = [...priceItems];
    updated[index] = { ...updated[index], [field]: value };
    setPriceItems(updated);
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError("Junkshop name is required");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (priceItems.length === 0) {
      setPriceItemError("Please add at least one price item");
      hasError = true;
    } else if (
      priceItems.some((row) => !row.materialId || !(parseFloat(row.price) > 0))
    ) {
      setPriceItemError("Please complete all material rows with a price above 0");
      hasError = true;
    } else {
      setPriceItemError(null);
    }

    if (hasError) return toast.error("Please check the highlighted fields");

    toast.loading("Saving junkshop");

    const success = await makeRequest({
      method: "PATCH",
      url: `/api/junkshop-sales/junkshop/${junkshopId}`,
      body: {
        name,
        description,
        location,
        isAvailable,
        priceItems: priceItems.map((item) => ({
          ...item,
          price: parseFloat(item.price),
        })),
      },
    });

    toast.dismiss();

    if (success) {
      toast.success("Junkshop updated");
      onClose();
      handleRefetchCount();
    } else {
      toast.error(errorMessageRef.current ?? "Updating junkshop failed");
    }
  };

  return createPortal(
    <Modal
      isOpen={true}
      onClose={onClose}
      icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
      title="Edit Junkshop"
      subtitle="Update this junkshop partner and its price listing"
      confirmLabel="Save"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="editJunkshopName" className="label">
            Name
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="editJunkshopName"
              className="w-full outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="editJunkshopDescription" className="label">
            Description
          </label>
          <textarea
            id="editJunkshopDescription"
            className="input mb-0 max-h-none resize-none"
            rows={3}
            placeholder="Optional notes about this junkshop"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label htmlFor="editJunkshopLocation" className="label">
            Location
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="editJunkshopLocation"
              className="w-full outline-none"
              placeholder="Optional address or landmark"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="min-w-full flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="label text-sm">Available</p>
            <p className="text-gray-500 text-xs">
              Shown as Available or Unavailable on the junkshop list
            </p>
          </div>
          <button
            className={`flex items-start ${
              isAvailable
                ? "justify-end bg-green-500/70"
                : "justify-start bg-[#EFEFEF]"
            } min-w-12 p-1 rounded-full shadow-inner duration-200 transition-all ease-out`}
            role="switch"
            type="button"
            aria-checked={isAvailable}
            onClick={() => setIsAvailable(!isAvailable)}
          >
            <span className="h-5 w-5 shadow rounded-full bg-white"></span>
          </button>
        </div>

        {/* Price Items */}
        <div className="flex flex-col gap-1">
          <label className="label">Price Items</label>
          <div className="flex flex-col gap-3">
            {priceItems.map((item, index) => (
              <div key={index} className="new-border bg-surface rounded-xl p-4">
                <div className="flex flex-row items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Material {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePriceItem(index)}
                    disabled={priceItems.length <= 1}
                    className="hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="w-5 stroke-gray-400" />
                  </button>
                </div>

                <div className="input flex items-center">
                  <select
                    className="w-full outline-none"
                    value={item.materialId}
                    onChange={(e) =>
                      updatePriceItem(index, "materialId", e.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      Select material
                    </option>
                    {materials.map((m) => (
                      <option
                        value={m.id}
                        key={m.id}
                        disabled={priceItems.some(
                          (p, i) => i !== index && p.materialId === m.id,
                        )}
                      >
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-row gap-2">
                  <div className="input flex-1 flex items-center mb-0">
                    <input
                      type="number"
                      className="w-full outline-none flex-1"
                      min={0}
                      placeholder="Price, e.g. 15"
                      value={item.price}
                      onChange={(e) =>
                        updatePriceItem(index, "price", e.target.value)
                      }
                    />
                  </div>
                  <div className="input w-24 flex items-center mb-0">
                    <select
                      className="w-full outline-none"
                      value={item.unit}
                      onChange={(e) =>
                        updatePriceItem(index, "unit", e.target.value)
                      }
                    >
                      <option value="KG">kg</option>
                      <option value="LBS">lbs</option>
                      <option value="GRAMS">gram</option>
                      <option value="PIECE">pcs</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {priceItemError && (
            <p className="text-red-400 text-xs">{priceItemError}</p>
          )}

          <button
            type="button"
            onClick={addPriceItem}
            className="mt-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-2 min-w-full"
          >
            <p className="text-gray-700">Add price item</p>
          </button>
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
