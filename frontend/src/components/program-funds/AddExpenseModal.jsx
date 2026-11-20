"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

export const AddExpenseModal = ({
  isModalOpen,
  setIsModalOpen,
  handleSummaryRefetchCount,
  handleTransactionRefetchCount,
}) => {
  const [programId, setProgramId] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { data } = useFetch({ url: "/api/redemption/programs" });
  const [programError, setProgramError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [amountError, setAmountError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const { makeRequest } = useMutation();

  const trimmedName = expenseName.trim();
  const trimmedDescription = description.trim();

  const onSubmit = async () => {
    let hasError = false;

    if (programId === "" || programId === null) {
      hasError = true;
      setProgramError("Program is required");
    } else {
      setProgramError(null);
    }

    if (trimmedName === "" || trimmedName === null) {
      hasError = true;
      setNameError("Expense name is required");
    } else {
      setNameError(null);
    }

    if (amount === "" || amount === null) {
      hasError = true;
      setAmountError("Amount is required");
    } else if (!(parseFloat(amount) > 0)) {
      hasError = true;
      setAmountError("Amount should be greater than 0");
    } else {
      setAmountError(null);
    }

    if (trimmedDescription === "" || trimmedDescription === null) {
      hasError = true;
      setDescriptionError("Description is required");
    } else {
      setDescriptionError(null);
    }

    if (hasError) return;

    toast.loading("Adding expense");

    const success = await makeRequest({
      url: "/api/program-funds/expenses",
      body: {
        programId,
        amount: parseFloat(amount),
        description: trimmedDescription,
        name: trimmedName,
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Adding expense success");
      resetModal();
      setIsModalOpen(false);
      handleSummaryRefetchCount();
      handleTransactionRefetchCount();
    } else {
      toast.dismiss();
      toast.error("Adding expense failed. Please try again");
    }
  };

  const resetModal = () => {
    setProgramId("");
    setExpenseName("");
    setAmount("");
    setDescription("");
    setProgramError(null);
    setAmountError(null);
    setNameError(null);
    setDescriptionError(null);
  };

  if (!isModalOpen) return null;

  return createPortal(
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        resetModal();
      }}
      icon={<BanknotesIcon className="w-6 stroke-accent" />}
      title="Add Expense"
      subtitle="Please input details for the program expense"
      confirmLabel="Add Expense"
      confirmClassName="gradient-button"
      onConfirm={onSubmit}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="programId" className="label">
            Program <span className="text-red-500">*</span>
          </label>
          <div className="input">
            <select
              id="programId"
              className="w-full outline-none"
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                setProgramError(null);
              }}
            >
              <option value="" disabled hidden>
                Select program
              </option>
              {data?.programs?.map((p) => (
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
          <label htmlFor="expenseName" className="label">
            Expense Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="expenseName"
            className="input"
            placeholder="Input expense name here"
            value={expenseName}
            onChange={(e) => {
              setExpenseName(e.target.value);
              setNameError(null);
            }}
          />
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="label">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            className="input"
            placeholder="Input amount here"
            min={0}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError(null);
            }}
          />
          {amountError && <p className="text-xs text-red-500">{amountError}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="label">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            className="input"
            placeholder="Input a short description for this expense"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDescriptionError(null);
            }}
          ></textarea>
          {descriptionError && (
            <p className="text-xs text-red-500">{descriptionError}</p>
          )}
        </div>
      </div>
    </Modal>,
    document.body,
  );
};
