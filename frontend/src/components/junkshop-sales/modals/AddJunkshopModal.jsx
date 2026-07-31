"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { BuildingStorefrontIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";



export function AddJunkshopModal({ isOpen, onClose, setIsModalOpen }) {
  const [priceItems, setPriceItems] = useState([
    { materialId: "", price: "", unit: "KG" },
  ]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [nameError, setNameError] = useState(null);
  const [priceItemError, setPriceItemError] = useState(null);
  const { data: materialData } = useFetch({ url: `/api/material/barangay` });
  const { makeRequest } = useMutation()

  const addPriceItem = () =>
    setPriceItems((prev) => [
      ...prev,
      { materialId: "", price: "", unit: "KG" },
    ]);

  const removePriceItem = (index) =>
    setPriceItems((prev) => prev.filter((_, i) => i !== index));

  const updatePriceItem = (index, field, value) => {
    const updated = [...priceItems];
    updated[index][field] = value;
    setPriceItems(updated);
  };


  if (!isOpen) return null;

  const resetModal = () => {
    setName("")
    setDescription("")
    setLocation("")
    setPriceItems([{ materialId: "", price: "", unit: "KG" }])
    setNameError(null)
    setPriceItemError(null)
    setIsModalOpen(false)
  }

  const handleSubmit = async () => {
    let hasError = false

    if (!name || name === "") {
      setNameError("Junkshop name is required")
      hasError = true
    } else {
      setNameError(null)
    }

    if (priceItems.length === 0) {
      setPriceItemError("Please complete at least one row of price item")
      hasError = true
    } else if (priceItems.some((row) => !row.materialId || !row.price || !row.unit)) {
      setPriceItemError("Please complete all material rows")
      hasError = true
    }

    if (hasError) return toast.error("Junkshop registration failed")

    toast.loading("Junkshop registration on process")

    const success = await makeRequest({
      url: `/api/junkshop-sales/junkshop`,
      body: {
        name,
        description,
        location,
        priceItems: priceItems.map((item) => ({
          ...item,
          price: parseFloat(item.price)
        }))
      }
    })

    if (success) {
      toast.dismiss()
      toast.success("Junkshop registered")
      resetModal()
      handleRefetchCount()
    } else {
      toast.dismiss()
      toast.error("Junkshop registration failed")
    }
  }


  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModal()
      }}
      icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
      title="Add Junkshop"
      subtitle="Register a new junkshop partner and its price listing"
      confirmLabel="Add Junkshop"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="junkshopName" className="label">
            Name
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="junkshopName"
              className="w-full outline-none"
              placeholder="e.g. Beddeng Recycling Center"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="junkshopDescription" className="label">
            Description
          </label>
          <textarea
            id="junkshopDescription"
            className="input mb-0 max-h-none resize-none"
            rows={3}
            placeholder="Optional notes about this junkshop"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label htmlFor="junkshopLocation" className="label">
            Location
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="junkshopLocation"
              className="w-full outline-none"
              placeholder="Optional address or landmark"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Price Items */}
        <div className="flex flex-col gap-1">
          <label className="label">Price Items</label>
          <div className="flex flex-col gap-3">
            {priceItems.map((_, index) => (
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

                {/* Material select */}
                <div className="input flex items-center">
                  <select
                    className="w-full outline-none"
                    defaultValue=""
                    onChange={(e) =>
                      updatePriceItem(index, "materialId", e.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      Select material
                    </option>
                    {materialData?.materials?.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price + Unit */}
                <div className="flex flex-row gap-2">
                  <div className="input flex-1 flex items-center mb-0">
                    <input
                      type="number"
                      className="w-full outline-none flex-1"
                      min={0}
                      placeholder="Price, e.g. 15"
                      onChange={(e) =>
                        updatePriceItem(index, "price", e.target.value)
                      }
                    />
                  </div>
                  <div className="input w-24 flex items-center mb-0">
                    <select
                      className="w-full outline-none"
                      defaultValue="KG"
                      onChange={(e) =>
                        updatePriceItem(index, "unit", e.target.value)
                      }
                    >
                      <option value="KG">kg</option>
                      <option value="PIECE">pcs</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {priceItemError && <p className="text-red-400 text-xs">{priceItemError}</p>}

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
