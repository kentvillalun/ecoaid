"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { TruckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export const ReleaseRewardModal = ({
  isOpen,
  onClose,
  handleReleasesRefetchCount,
  handleSummaryRefetchCount,
  handleItemsRefetchCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const [items, setItems] = useState([{ rewardItemId: "", quantity: "" }]);

  const [beneficiaryError, setBeneficiaryError] = useState(null);
  const [itemsError, setItemsError] = useState(null);

  const { data: rewardItemsData } = useFetch({ url: "/api/rewards/" });
  const { makeRequest } = useMutation();

  const rewardItems = rewardItemsData?.rewardItems ?? [];

  useEffect(() => {
    if (!searchQuery) return;

    const timeout = setTimeout(async () => {
      const res = await fetch(
        `/api/redemption/beneficiaries/search?name=${searchQuery}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();
      setSearchResults(data.beneficiaries);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value) setSearchResults([]);
  };

  const resetModal = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedBeneficiary(null);
    setItems([{ rewardItemId: "", quantity: "" }]);
    setBeneficiaryError(null);
    setItemsError(null);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const totalPointCost = items.reduce((sum, row) => {
    const item = rewardItems.find((r) => r.id === row.rewardItemId);
    if (!item || !row.quantity) return sum;
    return sum + item.pointCost * row.quantity;
  }, 0);

  const onSubmit = async () => {
    let hasError = false;

    if (!selectedBeneficiary) {
      setBeneficiaryError("Please select a beneficiary");
      hasError = true;
    } else {
      setBeneficiaryError(null);
    }

    if (
      items.length === 0 ||
      items.some((row) => !row.rewardItemId || !(row.quantity > 0))
    ) {
      setItemsError("Please add at least one item");
      hasError = true;
    } else {
      setItemsError(null);
    }

    if (hasError) return;

    const firstItem = rewardItems.find(
      (r) => r.id === items.find((row) => row.rewardItemId)?.rewardItemId,
    );

    toast.loading("Releasing reward");

    const success = await makeRequest({
      url: "/api/rewards/release",
      body: {
        beneficiaryId: selectedBeneficiary.id,
        programId: firstItem?.programId,
        items: items.map((row) => ({
          rewardItemId: row.rewardItemId,
          quantity: parseFloat(row.quantity),
        })),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Reward released");
      handleReleasesRefetchCount();
      handleSummaryRefetchCount();
      handleItemsRefetchCount();
      resetModal();
      onClose();
    } else {
      toast.dismiss();
      toast.error("Releasing reward failed");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModal();
        onClose();
      }}
      icon={<TruckIcon className="w-6 stroke-accent" />}
      title="Release Reward"
      subtitle="Search for a beneficiary and release reward items"
      confirmLabel="Release Reward"
      confirmClassName="gradient-button"
      onConfirm={onSubmit}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="label">Beneficiary</label>
          <div className="input flex flex-row items-center relative mb-0">
            <input
              type="text"
              className="w-full outline-none px-3.5"
              placeholder="Search Beneficiary"
              value={searchQuery}
              onChange={handleSearchChange}
            />

            {selectedBeneficiary && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-3xl py-1 px-2 text-nowrap mr-2">
                {selectedBeneficiary.points} pts
              </span>
            )}
            {selectedBeneficiary && (
              <button
                className="pr-3.5 hover:cursor-pointer"
                type="button"
                onClick={() => {
                  setSelectedBeneficiary(null);
                  setSearchQuery("");
                }}
              >
                <XMarkIcon className="w-5 stroke-gray-400" />
              </button>
            )}
            {searchQuery && !selectedBeneficiary && (
              <div className="absolute bg-surface flex flex-col w-full items-start z-40 rounded-lg new-border text-sm py-2.5 top-11.5">
                {searchResults.length > 0 ? (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="px-3.5 hover:cursor-pointer hover:bg-gray-50 w-full py-1 flex flex-row items-center justify-between"
                      onClick={() => {
                        setSelectedBeneficiary(r);
                        setSearchQuery(r.name);
                      }}
                    >
                      <p className="text-text-primary">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.points} pts</p>
                    </div>
                  ))
                ) : (
                  <p className="px-3.5 py-1 text-gray-500">
                    No beneficiary found
                  </p>
                )}
              </div>
            )}
          </div>
          {beneficiaryError && (
            <p className="text-xs text-red-500 text-start">
              {beneficiaryError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="label">Reward items</label>

          <div className="flex flex-col gap-3">
            {items.map((row, index) => {
              const selectedItem = rewardItems.find(
                (r) => r.id === row.rewardItemId,
              );

              return (
                <div
                  key={index}
                  className="new-border bg-surface rounded-xl p-4"
                >
                  <div className="flex flex-row items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Item {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="hover:cursor-pointer"
                      disabled={items.length === 1}
                    >
                      <XMarkIcon className="w-5 stroke-gray-400" />
                    </button>
                  </div>

                  <div className="input mb-2 flex items-center">
                    <select
                      className="w-full outline-none"
                      onChange={(e) =>
                        updateRow(index, "rewardItemId", e.target.value)
                      }
                      value={row.rewardItemId}
                    >
                      <option value="" disabled hidden>
                        Select reward item
                      </option>
                      {rewardItems.map((r) => (
                        <option value={r.id} key={r.id}>
                          {r.name} ({r.available} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-row gap-2">
                    <div className="flex-1 input flex items-center gap-2">
                      <input
                        type="number"
                        className="w-full outline-none flex-1"
                        min={0}
                        placeholder="e.g. 1"
                        onChange={(e) =>
                          updateRow(index, "quantity", e.target.value)
                        }
                        value={row.quantity}
                      />
                      <label className="text-sm text-nowrap">
                        {selectedItem?.pointCost ?? 0} pts/item
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {itemsError && (
            <p className="text-xs text-red-500 text-start">{itemsError}</p>
          )}

          <div className="min-w-full border-t border-gray-200 mt-3 flex flex-col gap-3 pt-3">
            <div className="flex flex-row items-center justify-between">
              <label className="text-sm text-gray-700 flex">
                Total Point Cost
              </label>
              <p className="text-gray-700 font-semibold">
                {totalPointCost} pts
              </p>
            </div>
            <button
              className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-1 min-w-full"
              type="button"
              onClick={() =>
                setItems([...items, { rewardItemId: "", quantity: "" }])
              }
            >
              <p>Add row</p>
            </button>
          </div>
        </div>
      </div>
    </Modal>,
    document.body,
  );
};
