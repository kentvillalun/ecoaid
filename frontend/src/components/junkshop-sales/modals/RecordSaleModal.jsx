"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

export function RecordSaleModal({
  isOpen,
  setIsModalOpen,
  preselectedJunkshopId = "",
  junkshops,
  setPreselectedJunkshop,
  setSalesRefetchCount,
}) {
  const [items, setItems] = useState([
    { materialId: "", quantity: "", unit: "KG" },
  ]);
  const { makeRequest } = useMutation();

  const addItem = () =>
    setItems((prev) => [...prev, { materialId: "", quantity: "", unit: "kg" }]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  if (!isOpen) return null;

  const resetModal = () => {
    setPreselectedJunkshop("");
    setItems([{ materialId: "", quantity: "", unit: "KG" }]);
  };

  const selectedJunkshop = junkshops?.find(
    (shop) => shop.id === preselectedJunkshopId,
  );

  const handleSubmit = async () => {
    if (!preselectedJunkshopId || preselectedJunkshopId === "") {
      toast.error("Recording failed. Junkshop is required");
      return
    }

    if (
      items.length === 0 ||
      items.some((row) => !row.materialId || !row.quantity || !row.unit)
    ) {
      toast.error("Recording failed. Please add at least one material item");
      return
    }

    toast.loading("Recording sale");

    const success = await makeRequest({
      url: `/api/junkshop-sales`,
      body: {
        junkshopId: preselectedJunkshopId,
        items: items.map((item) => ({
          ...item,
          quantity: parseFloat(item.quantity),
        })),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Sale recorded");
      setSalesRefetchCount((prev) => prev + 1);
      resetModal();
      setIsModalOpen(false)
    } else {
      toast.dismiss()
      toast.error("Recording sale failed")
    }
  };

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsModalOpen(false);
        resetModal();
      }}
      icon={<ShoppingBagIcon className="w-6 stroke-new-primary" />}
      title="Record Sale"
      subtitle="Log a junkshop sale transaction"
      confirmLabel="Record Sale"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Junkshop select */}
        <div className="flex flex-col gap-1">
          <label className="label">Junkshop</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
            <select
              className="w-full outline-none"
              defaultValue={preselectedJunkshopId ?? ""}
              onChange={(e) => setPreselectedJunkshop(e.target.value)}
            >
              <option value="" disabled hidden>
                Select junkshop
              </option>
              {junkshops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic item rows */}
        <div className="flex flex-col gap-1">
          <label className="label">Materials sold</label>
          <div className="flex flex-col gap-3">
            {items.map((_, index) => (
              <div key={index} className="new-border bg-white rounded-xl p-4">
                <div className="flex flex-row items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Material {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="w-5 stroke-gray-400" />
                  </button>
                </div>

                {/* Material select */}
                <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2 flex items-center">
                  <select
                    className="w-full outline-none"
                    defaultValue=""
                    onChange={(e) => {
                      updateRow(index, "materialId", e.target.value);
                    }}
                    disabled={preselectedJunkshopId === ""}
                  >
                    <option value="" disabled hidden>
                      {preselectedJunkshopId === ""
                        ? "Please select a junkshop first"
                        : "Select material"}
                    </option>
                    {selectedJunkshop?.priceItems?.map((item) => (
                      <option value={item.material.id} key={item.material.id}>
                        {item.material.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity + Unit */}
                <div className="flex flex-row gap-2">
                  <div className="flex-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
                    <input
                      type="number"
                      className="w-full outline-none flex-1"
                      min={0}
                      placeholder="e.g. 5"
                      onChange={(e) => {
                        updateRow(index, "quantity", e.target.value);
                      }}
                    />
                  </div>
                  <div className="w-24 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
                    <select
                      className="w-full outline-none"
                      defaultValue="KG"
                      onChange={(e) => {
                        updateRow(index, "unit", e.target.value);
                      }}
                    >
                      <option value="KG">kg</option>
                      <option value="PIECE">pcs</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-2 min-w-full"
          >
            <p className="text-gray-700">Add material</p>
          </button>
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
