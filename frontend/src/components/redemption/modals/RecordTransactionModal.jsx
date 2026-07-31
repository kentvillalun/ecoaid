"use client";

import { Modal } from "@/components/ui/Modal";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const schema = yup.object().shape({
  programId: yup.string().required("Program is required"),
  educationalLevel: yup.string().nullable().optional(),
});

export const RecordTransactionModal = ({
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  setTransactionRefetchCount,
  data,
  preselectedProgram,
  currentBarangayData,
}) => {
  const { makeRequest, isLoading, error, isError } = useMutation();
  const url = "/api/redemption/transactions";

  const filteredData = data?.filter((d) => d.isActive === true);

  const [materialRows, setMaterialRows] = useState([
    { programMaterialId: "", amount: "" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [isCreatingBeneficiary, setIsCreatingBeneficiary] = useState(false);
  const [newBeneficiaryName, setNewBeneficiaryName] = useState("");

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      programId: "",
      educationalLevel: null,
    },
  });

  useEffect(() => {
    if (preselectedProgram) {
      setValue("programId", preselectedProgram.id);
    }
  }, [preselectedProgram]);

  const selectedProgramId = watch("programId");
  const selectedProgram =
    preselectedProgram ?? filteredData?.find((p) => p.id === selectedProgramId);

  const onSubmit = async (formData) => {
    if (
      materialRows.length === 0 ||
      materialRows.some((row) => !row.programMaterialId || !row.amount)
    ) {
      return toast.error(
        "Creation failed. Please add at least one material item",
      );
    }

    if (isCreatingBeneficiary) {
      if (!newBeneficiaryName.trim()) {
        return toast.error("Please input a beneficiary name");
      }
    } else if (!selectedBeneficiary) {
      return toast.error("Please select or create a beneficiary");
    }

    toast.loading("Creating transaction");

    const success = await makeRequest({
      url,
      body: {
        programId: formData.programId,
        ...(isCreatingBeneficiary
          ? { beneficiaryName: newBeneficiaryName }
          : { beneficiaryId: selectedBeneficiary.id }),
        educationalLevel: formData.educationalLevel,
        items: materialRows.map((row) => ({
          ...row,
          amount: parseFloat(row.amount),
        })),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Transaction created");
      setTransactionRefetchCount((prev) => prev + 1);
      setMaterialRows([{ programMaterialId: "", amount: "" }]);
      setSelectedBeneficiary(null);
      setSearchQuery("");
      setIsCreatingBeneficiary(false);
      setNewBeneficiaryName("");
      setIsTransactionModalOpen(false);
    } else {
      toast.dismiss();
      toast.error("Creating transaction failed");
    }
  };

  const removeRow = (index) => {
    const removed = materialRows.filter((m, i) => i !== index);
    setMaterialRows(removed);
  };

  const updateRow = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;
    setMaterialRows(updated);
  };

  const totalValue = materialRows.reduce((sum, row) => {
    const material = selectedProgram?.programMaterial.find(
      (p) => p.id === row.programMaterialId,
    );
    if (!material) {
      sum += 0;
      return sum;
    }

    return (
      sum +
      (selectedProgram?.isCashMode ? material.cashValue : material.pointValue) *
        row.amount
    );
  }, 0);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

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

  return (
    <Modal
      title={"Record Transaction"}
      isOpen={isTransactionModalOpen}
      onClose={() => setIsTransactionModalOpen(false)}
      icon={<Bars3BottomLeftIcon className="stroke-accent w-6" />}
      subtitle={"Choose program and record transaction"}
      confirmLabel={"Record Transaction"}
      confirmClassName={
        "gradient-button transition-all duration-200 ease-in-out"
      }
      buttonLabelSize="text-sm"
      onConfirm={() => handleSubmit(onSubmit)()}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">Program</label>
          {preselectedProgram ? (
            <input
              className="input mb-0"
              value={preselectedProgram.name}
              disabled
              {...register("programId")}
            />
          ) : (
            <div className="input flex items-center mb-0">
              <select
                className="w-full outline-none"
                defaultValue=""
                {...register("programId")}
              >
                <option value="" disabled hidden>
                  Select program
                </option>
                {filteredData?.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.programId && (
            <p className="xs text-red-500 text-start">
              {errors.programId?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {isCreatingBeneficiary ? (
            <>
              <div className="flex flex-row items-center justify-between">
                <label className="text-text-primary font-medium">
                  Beneficiary Name
                </label>
                <button
                  type="button"
                  className="text-xs text-accent hover:cursor-pointer"
                  onClick={() => {
                    setIsCreatingBeneficiary(false);
                    setNewBeneficiaryName("");
                  }}
                >
                  Back to search
                </button>
              </div>
              <div className="input flex flex-row items-center mb-0">
                <input
                  type="text"
                  className="w-full outline-none px-3.5"
                  placeholder="Input beneficiary name"
                  value={newBeneficiaryName}
                  onChange={(e) => setNewBeneficiaryName(e.target.value)}
                />
                <button
                  className="pr-3.5 hover:cursor-pointer"
                  type="button"
                  onClick={() => {
                    setIsCreatingBeneficiary(false);
                    setNewBeneficiaryName("");
                  }}
                >
                  <XMarkIcon className="w-5 stroke-gray-400" />
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="text-text-primary font-medium">
                Beneficiary
              </label>

              <div className="input flex flex-row items-center relative mb-0">
                <input
                  type="text"
                  className="w-full outline-none px-3.5"
                  placeholder="Search Beneficiary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                          <p className="text-xs text-gray-500">
                            {r.points} pts
                          </p>
                        </div>
                      ))
                    ) : (
                      <>
                        <p className="px-3.5 py-1 text-gray-500">
                          No beneficiaries found
                        </p>
                        <button
                          type="button"
                          className="px-3.5 hover:cursor-pointer hover:bg-gray-50 w-full py-1.5 flex flex-row items-center gap-1.5 text-accent font-medium"
                          onClick={() => {
                            setIsCreatingBeneficiary(true);
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                        >
                          <PlusIcon className="w-4" />
                          Create new beneficiary
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-text-primary font-medium">
            Educational level
          </label>
          <div className="input flex items-center mb-0">
            <select
              className="w-full outline-none"
              defaultValue=""
              {...register("educationalLevel")}
            >
              <option value="" disabled hidden>
                Select educational level
              </option>
              <option value="PRIMARY" className="">
                Primary
              </option>
              <option value="SECONDARY">Secondary</option>
              <option value="TERTIARY">Tertiary</option>
            </select>
          </div>
          {errors.educationalLevel && (
            <p className="text-xs text-red-500 text-start">
              {errors.educationalLevel?.message}
            </p>
          )}
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
                    disabled={selectedProgramId === ""}
                    onChange={(e) => {
                      updateRow(index, "programMaterialId", e.target.value);
                    }}
                    value={material.programMaterialId}
                  >
                    <option value="" disabled hidden>
                      {selectedProgramId === ""
                        ? "Select program first"
                        : "Select material"}
                    </option>
                    {selectedProgram?.programMaterial.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m?.material?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-row gap-2">
                  <div className="input flex-1 flex items-center gap-2 mb-0">
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
                      {selectedProgram?.isCashMode
                        ? `₱/${selectedProgram?.programMaterial?.find((m) => m.id === material?.programMaterialId)?.material?.defaultUnit?.toLowerCase() ?? "unit"}`
                        : `pts/${selectedProgram?.programMaterial?.find((m) => m.id === material?.programMaterialId)?.material?.defaultUnit?.toLowerCase() ?? "unit"}`}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="min-w-full border-t  border-gray-200 mt-3 flex flex-col gap-3 pt-3">
            <div className="flex flex-row items-center justify-between">
              <label className="text-sm text-gray-700 flex">
                Estimated total
              </label>
              <p className="text-gray-700">
                {selectedProgram?.isCashMode
                  ? `₱ ${totalValue}`
                  : `${totalValue} pts`}
              </p>
            </div>
            <button
              className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer flex flex-row items-center justify-center gap-1 min-w-full"
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
      </div>
    </Modal>
  );
};
