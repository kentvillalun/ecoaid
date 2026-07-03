"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";

const JUNKSHOPS = [
  { id: "js1", name: "Reyes Junkshop" },
  { id: "js2", name: "Dela Cruz Trading" },
  { id: "js3", name: "Vigan Recyclers" },
];

const MOCK_MATERIALS = [
  { id: "m1", name: "PET Bottles" },
  { id: "m2", name: "Iron Scraps" },
  { id: "m3", name: "Newspaper" },
  { id: "m4", name: "Glass Bottles" },
  { id: "m5", name: "Cardboard" },
  { id: "m6", name: "Aluminum Cans" },
];

export function RecordSaleModal({
  isOpen,
  onClose,
  preselectedJunkshopId = undefined,
}) {
  const [items, setItems] = useState([
    { materialId: "", quantity: "", unit: "kg" },
  ]);

  const addItem = () =>
    setItems((prev) => [...prev, { materialId: "", quantity: "", unit: "kg" }]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<ShoppingBagIcon className="w-6 stroke-new-primary" />}
      title="Record Sale"
      subtitle="Log a junkshop sale transaction"
      confirmLabel="Record Sale"
      confirmClassName="gradient-button"
      onConfirm={() => {}}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Junkshop select */}
        <div className="flex flex-col gap-1">
          <label className="label">Junkshop</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
            <select
              className="w-full outline-none"
              defaultValue={preselectedJunkshopId ?? ""}
            >
              <option value="" disabled hidden>
                Select junkshop
              </option>
              {JUNKSHOPS.map((shop) => (
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
                  <select className="w-full outline-none" defaultValue="">
                    <option value="" disabled hidden>
                      Select material
                    </option>
                    {MOCK_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
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
                    />
                  </div>
                  <div className="w-24 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
                    <select className="w-full outline-none" defaultValue="kg">
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
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
