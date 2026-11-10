"use client";

import { Modal } from "@/components/ui/Modal";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { useState } from "react";

// Fix the materials or amounts of a transaction. The resident and program
// can't be changed here, delete the transaction if it went to the wrong person.
export const EditTransactionModal = ({
  isOpen,
  setIsOpen,
  transaction,
  handleRefetchCount,
}) => {
  const { makeRequest, errorMessageRef } = useMutation();

  const [materialRows, setMaterialRows] = useState(
    transaction.redemptionTransactionItem.map((item) => ({
      programMaterialId: item.programMaterialId,
      amount: item.amount,
    })),
  );

  const removeRow = (index) => {
    setMaterialRows(materialRows.filter((m, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;
    setMaterialRows(updated);
  };

  const onSubmit = async () => {
    if (
      materialRows.length === 0 ||
      materialRows.some((row) => !row.programMaterialId || !row.amount)
    ) {
      return toast.error("Please add at least one material item");
    }

    toast.loading("Updating transaction");

    const success = await makeRequest({
      url: `/api/redemption/transactions/${transaction.id}`,
      method: "PATCH",
      body: {
        items: materialRows.map((row) => ({
          programMaterialId: row.programMaterialId,
          amount: parseFloat(row.amount),
        })),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Transaction updated");
      handleRefetchCount();
      setIsOpen(false);
    } else {
      toast.dismiss();
      toast.error(errorMessageRef.current ?? "Updating transaction failed");
    }
  };

  return (
    <Modal
      title={"Edit Transaction"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<PencilSquareIcon className="stroke-accent w-6" />}
      subtitle={"Fix the materials or amounts"}
      confirmLabel={"Save Changes"}
      confirmClassName={
        "gradient-button transition-all duration-200 ease-in-out"
      }
      buttonLabelSize="text-sm"
      onConfirm={() => onSubmit()}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">Resident</label>
          <input
            className="input mb-0"
            value={transaction.residentName}
            disabled
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">
            Material items
          </label>

          <div className="flex flex-col gap-3">
            {materialRows.map((material, index) => (
              <div key={index} className="new-border bg-surface rounded-xl p-4">
                <div className="flex flex-row items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Material {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="hover:cursor-pointer"
                    disabled={materialRows.length === 1}
                  >
                    <XMarkIcon className="w-5 stroke-gray-400" />
                  </button>
                </div>

                <div className="input flex items-center">
                  <select
                    className="w-full outline-none"
                    onChange={(e) => {
                      updateRow(index, "programMaterialId", e.target.value);
                    }}
                    value={material.programMaterialId}
                  >
                    <option value="" disabled hidden>
                      Select material
                    </option>
                    {transaction.program.programMaterial.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.material.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input flex items-center gap-2 mb-0">
                  <input
                    type="number"
                    className="w-full outline-none flex-1"
                    min={0}
                    placeholder="e.g. 2"
                    onChange={(e) => {
                      updateRow(index, "amount", e.target.value);
                    }}
                    value={material.amount}
                  />
                  <label className="text-sm text-nowrap">
                    {transaction.program.programMaterial
                      .find((m) => m.id === material.programMaterialId)
                      ?.material?.defaultUnit?.toLowerCase() ?? "unit"}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-1 min-w-full mt-3"
            type="button"
            onClick={() => {
              setMaterialRows([
                ...materialRows,
                { programMaterialId: "", amount: "" },
              ]);
            }}
          >
            <p className="">Add row</p>
          </button>
        </div>
      </div>
    </Modal>
  );
};
