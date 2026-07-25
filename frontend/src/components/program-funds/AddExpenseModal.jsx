"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

export const AddExpenseModal = ({ isModalOpen, setIsModalOpen, handleSummaryRefetchCount, handleTransactionRefetchCount }) => {
  const [programId, setProgramId] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { data } = useFetch({ url: "/api/redemption/programs" });
  const [isProgramError, setIsProgramError] = useState(false);
  const [isNameError, setIsNameError] = useState(false);
  const [isAmountError, setIsAmountError] = useState(false);
  const [isDescriptionError, setIsDescriptionError] = useState(false);
  const { makeRequest } = useMutation();

  const onSubmit = async () => {
    let hasError = false;

    if (programId === "" || programId === null) {
      hasError = true;
      setIsProgramError(true);
    } else {
      setIsProgramError(false);
    }

    if (expenseName === "" || expenseName === null) {
      hasError = true;
      setIsNameError(true);
    } else {
      setIsNameError(false);
    }

    if (amount === "" || amount === null) {
      hasError = true;
      setIsAmountError(true);
    } else {
      setIsAmountError(false);
    }

    if (description === "" || description === null) {
      hasError = true;
      setIsDescriptionError(true);
    } else {
      setIsDescriptionError(false)
    }

    if (hasError) return toast.error("Adding expense failed");

    toast.loading("Adding expense");

    const success = await makeRequest({
      url: "/api/program-funds/expenses",
      body: {
        programId,
        amount: parseFloat(amount),
        description,
        name: expenseName
      }
    });

    if (success) {
      toast.dismiss()
      toast.success("Adding expense success")
      resetModal()
      setIsModalOpen(false)
      handleSummaryRefetchCount()
      handleTransactionRefetchCount()
    } else {
      toast.dismiss()
      toast.error("Adding expense failed. Please try again")
    }
  };

  const resetModal = () => {
    setProgramId("")
    setExpenseName("")
    setAmount("")
    setDescription("")
    setIsProgramError(false)
    setIsAmountError(false)
    setIsNameError(false)
    setIsDescriptionError(false)
  }

  if (!isModalOpen) return null;

  return createPortal(
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false)
        resetModal()
      }}
      icon={<BanknotesIcon className="w-6 stroke-cta-color" />}
      title="Add Expense"
      subtitle="Please input details for the program expense"
      confirmLabel="Add Expense"
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
              {data?.programs?.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {isProgramError && (
            <p className="text-xs text-red-500">Program is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="expenseName" className="label">
            Expense Name
          </label>
          <input
            type="text"
            id="expenseName"
            className="input"
            placeholder="Input expense name here"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />
          {isNameError && (
            <p className="text-xs text-red-500">Expense name is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="label">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            className="input"
            placeholder="Input amount here"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {isAmountError && (
            <p className="text-xs text-red-500">Amount is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            className="input"
            placeholder="Input a short description for this expense"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {isDescriptionError && (
            <p className="text-xs text-red-500">Description is required</p>
          )}
        </div>
      </div>
    </Modal>,
    document.body,
  );
};
