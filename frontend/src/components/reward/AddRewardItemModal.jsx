"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { GiftIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

const MOCK_PROGRAMS = [
  { id: "p1", name: "Sitio Clean-Up Drive" },
  { id: "p2", name: "Community Buyback Rewards" },
  { id: "p3", name: "School Support Program" },
  { id: "p4", name: "Senior Citizen Assistance" },
];

const CATEGORY_OPTIONS = [
  { value: "MEDICINE", label: "Medicine" },
  { value: "GOODS", label: "Goods" },
  { value: "SCHOOL_SUPPLIES", label: "School Supplies" },
  { value: "SERVICES", label: "Services" },
  { value: "OTHERS", label: "Others" },
];

export const AddRewardItemModal = ({
  isOpen,
  setIsModalOpen,
  handleRewardItemsRefetchCount,
  handleSummaryRefetchCount,
}) => {
  const [programId, setProgramId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pointCost, setPointCost] = useState("");
  const [nameError, setNameError] = useState(null);
  const [quantityError, setQuantityError] = useState(null);
  const [pointCostError, setPointCostError] = useState(null);
  const [programError, setProgramError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);

  const { data: programData } = useFetch({ url: "/api/redemption/programs" });
  const { makeRequest } = useMutation();

  const activePrograms = programData?.programs?.filter(
    (p) => p?.isActive === true,
  );

  const resetModal = () => {
    setProgramId("");
    setName("");
    setCategory("");
    setQuantity("");
    setPointCost("");
    setNameError(null);
    setQuantityError(null);
    setPointCostError(null);
    setProgramError(null);
    setCategoryError(null);
  };

  const onSubmit = async () => {
    let hasError = false;

    if (programId === "" || programId === null) {
      setProgramError("Program is required");
      hasError = true;
    } else {
      setProgramError(null);
    }

    if (name === "" || name === null) {
      setNameError("Name is required");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (category === "" || category === null) {
      setCategoryError("Category is required");
      hasError = true;
    } else {
      setCategoryError(null);
    }

    if (quantity <= 0 || quantity === null) {
      setQuantityError("Quantity must be greated than 0");
      hasError = true;
    } else {
      setQuantityError(null);
    }

    if (pointCost <= 0 || pointCost === null) {
      setPointCostError("Point cost must be greated than 0");
      hasError = true;
    } else {
      setPointCostError(null);
    }

    if (hasError)
      return toast.error("Adding reward item failed. Please try again.");

    toast.loading();

    const success = await makeRequest({
      url: "/api/rewards",
      body: {
        programId,
        name,
        category,
        quantity: parseFloat(quantity),
        pointCost: parseFloat(pointCost),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Reward item successfully added");
      resetModal();
      setIsModalOpen(false);
      handleRewardItemsRefetchCount();
      handleSummaryRefetchCount();
    } else {
      toast.dismiss();
      toast.error("Adding reward item failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsModalOpen(false);
        resetModal();
      }}
      icon={<GiftIcon className="w-6 stroke-accent" />}
      title="Add Reward Item"
      subtitle="Add a new reward item to stock"
      confirmLabel="Add Item"
      confirmClassName="gradient-button"
      onConfirm={onSubmit}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="programId" className="label">
            Program
          </label>
          <div className="input">
            <select
              id="programId"
              className="w-full outline-none"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              <option value="" disabled hidden>
                Select program
              </option>
              {activePrograms?.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {programError && (
            <p className="text-xs text-red-500">{programError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="label">
            Reward Item Name
          </label>
          <input
            type="text"
            id="name"
            className="input"
            placeholder="Input reward item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="label">
            Category
          </label>
          <div className="input">
            <select
              id="category"
              className="w-full outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled hidden>
                Select category
              </option>
              {CATEGORY_OPTIONS.map((c) => (
                <option value={c.value} key={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {categoryError && (
            <p className="text-xs text-red-500">{categoryError}</p>
          )}
        </div>

        <div className="flex flex-row gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="quantity" className="label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              className="input"
              placeholder="e.g. 50"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {quantityError && (
              <p className="text-xs text-red-500">{quantityError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="pointCost" className="label">
              Point Cost
            </label>
            <input
              type="number"
              id="pointCost"
              className="input"
              placeholder="e.g. 100"
              min={0}
              value={pointCost}
              onChange={(e) => setPointCost(e.target.value)}
            />
            {pointCostError && (
              <p className="text-xs text-red-500">{pointCostError}</p>
            )}
          </div>
        </div>
      </div>
    </Modal>,
    document.body,
  );
};
