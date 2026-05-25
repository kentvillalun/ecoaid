"use client";

import { Modal } from "@/components/ui/Modal";
import {
  Bars3BottomLeftIcon,
  TrashIcon,
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
  beneficiaryName: yup.string().required("Beneficiary name is required"),
  collectorName: yup.string().required("Collector name is required"),
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
      beneficiaryName: "",
      collectorName: "",
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
        "Creation failed. Please add at least oen material item",
      );
    }

    toast.loading("Creating transaction");

    const success = await makeRequest({
      url,
      body: {
        programId: formData.programId,
        collectorName: formData.collectorName,
        beneficiaryName: formData.beneficiaryName,
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
      setIsTransactionModalOpen(false);
    } else {
      toast.dismiss();
      toast.error("Creating transaction failed");
    }
  };

  useEffect(() => {
    if (!currentBarangayData) return;
    setValue(
      "collectorName",
      `${currentBarangayData.user.firstName} ${currentBarangayData.user.lastName}`,
    );
  }, [currentBarangayData]);

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
    const material = selectedProgram?.programMaterial.find(p => p.id === row.programMaterialId)
    if (!material) {
      sum += 0
      return sum
    }

    return sum + (selectedProgram?.isCashMode ? material.cashValue : material.pointValue) * row.amount
    
  }, 0)

  return (
    <Modal
      title={"Record Transaction"}
      isOpen={isTransactionModalOpen}
      onClose={() => setIsTransactionModalOpen(false)}
      icon={<Bars3BottomLeftIcon className="stroke-black w-6" />}
      subtitle={"Choose program and record transaction"}
      confirmLabel={"Record Transaction"}
      confirmClassName={
        "bg-[#74C857] hover:bg-primary transition-all duration-200 ease-in-out"
      }
      buttonLabelSize="text-sm"
      onConfirm={() => handleSubmit(onSubmit)()}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Program</label>
          {preselectedProgram ? (
            <input
              className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11 max-h-11"
              value={preselectedProgram.name}
              disabled
              {...register("programId")}
            />
          ) : (
            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11 max-h-11 flex items-center">
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
            <p className="text-[14px] text-red-500 text-start">
              {errors.programId?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Collector</label>
          <input
            type="text"
            className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg  transition-colors min-h-11 max-h-11 bg-gray-100 cursor-default"
            placeholder="Input collectors' name here"
            readOnly
            value={
              currentBarangayData
                ? `${currentBarangayData.user.firstName} ${currentBarangayData.user.lastName}`
                : "Loading..."
            }
            {...register("collectorName")}
          />
          {errors.collectorName && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.collectorName?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Beneficiary name</label>
          <input
            type="text"
            className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11"
            placeholder="Input name here"
            {...register("beneficiaryName")}
          />
          {errors.beneficiaryName && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.beneficiaryName?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-gray-700 font-medium">Educational level</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11 flex items-center">
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
            <p className="text-[14px] text-red-500 text-start">
              {errors.educationalLevel?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Material items</label>

          <div className="md:grid grid-cols-2 hidden gap-2 ">
            <label className="text-sm text-gray-700">Material name</label>
            <label className="text-sm text-gray-700">Amount</label>
          </div>

          <div className="flex flex-col gap-2">
            {materialRows.map((material, index) => (
              <div className="flex flex-col gap-1" key={index}>
                <label className="text-sm text-gray-700 md:hidden flex">
                  Material name and amount
                </label>
                <div className="md:grid-cols-2 grid-cols-1 grid gap-2">
                  <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11 flex items-center">
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
                  <div className="flex flex-row items-center justify-between gap-4 max-w-full">
                    <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11 flex items-center flex-1 flex-row justify-between w-full gap-4">
                      <input
                        type="number"
                        className="w-full outline-none gap-2 flex-1"
                        min={0}
                        placeholder="e.g. 2"
                        onChange={(e) => {
                          updateRow(index, "amount", e.target.value);
                        }}
                        value={material.amount}
                      />

                      <label className="text-sm">
                        {selectedProgram?.isCashMode
                          ? `₱/${selectedProgram?.programMaterial?.find((m) => m.id === material?.programMaterialId)?.material?.defaultUnit?.toLowerCase() ?? "unit"}`
                          : `pts/${selectedProgram?.programMaterial?.find((m) => m.id === material?.programMaterialId)?.material?.defaultUnit?.toLowerCase() ?? "unit"}`}
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="hover:cursor-pointer"
                      disabled={materialRows.length === 1}
                    >
                      <TrashIcon className="w-6 stroke-gray-400 " />
                    </button>
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
              <p className="text-gray-700">{selectedProgram?.isCashMode ? `₱ ${totalValue}` : `${totalValue} pts`}</p>
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
