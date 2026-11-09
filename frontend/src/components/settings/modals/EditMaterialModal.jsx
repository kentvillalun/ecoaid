"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { CubeIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

export function EditMaterialModal({
  material,
  onClose,
  handleMaterialRefetchCount,
}) {
  const [unit, setUnit] = useState(material?.defaultUnit ?? "");
  const { makeRequest } = useMutation();

  if (!material) return null;

  const handleSubmit = async () => {
    if (!unit) return toast.error("Please select a unit");

    if (unit === material.defaultUnit) return onClose();

    toast.loading("Updating material unit");

    const success = await makeRequest({
      method: "PATCH",
      url: `/api/settings/materials/${material.id}`,
      body: { defaultUnit: unit },
    });

    toast.dismiss();

    if (success) {
      toast.success("Material unit updated");
      onClose();
      handleMaterialRefetchCount();
    } else {
      toast.error("Updating material unit failed. Please try again.");
    }
  };

  return createPortal(
    <Modal
      isOpen={true}
      onClose={onClose}
      icon={<CubeIcon className="w-6 stroke-accent" />}
      title="Edit Material Unit"
      subtitle={material.name}
      confirmLabel="Save"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="editMaterialUnit" className="label">
            Default unit
          </label>
          <div className="input flex items-center mb-0">
            <select
              id="editMaterialUnit"
              className="w-full outline-none"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="" disabled hidden>
                Select unit
              </option>
              <option value="KG">kg</option>
              <option value="LBS">lbs</option>
              <option value="GRAMS">gram</option>
              <option value="PIECE">pcs</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          Redemption programs and the resident capture form use this unit.
          Redemption records already saved for this material will also show the
          new unit, so only change it if the current unit was wrong.
        </p>
      </div>
    </Modal>,
    document.body,
  );
}
