"use client";

import { Modal } from "@/components/ui/Modal";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { use, useEffect } from "react";

const schema = yup.object().shape({
  programId: yup.string().required("Program is required"),
  programMaterialId: yup.string().required("Material is required"),
  beneficiaryName: yup.string().required("Beneficiary name is required"),
  collectorName: yup.string().required("Collector name is required"),
  quantity: yup
    .number("Please input numbers only")
    .required("Quantity is required"),
  educationalLevel: yup
    .string()
    .oneOf(["PRIMARY", "SECONDARY", "TERTIARY"], "Invalid educational level")
    .required("Educational level is required"),
});

export const RecordTransactionModal = ({
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  setTransactionRefetchCount,
  data,
  preselectedProgram,
  currentBarangayData
}) => {
  const { makeRequest, isLoading, error, isError } = useMutation();
  const url = "/api/redemption/transactions";

  const filteredData = data?.filter((d) => d.isActive === true);

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
      programMaterialId: "",
      beneficiaryName: "",
      collectorName: "",
      quantity: null,
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
    toast.loading("Creating transaction");
    const success = await makeRequest({
      url,
      body: formData,
    });

    if (success) {
      toast.dismiss();
      toast.success("Transaction created");
      setTransactionRefetchCount((prev) => prev + 1);
      setValue("programMaterialId", "");
      setValue("quantity", null);
    } else {
      toast.dismiss();
      toast.error("Creating transaction failed");
    }
  };

  useEffect(() => {
    if (!currentBarangayData) return;
    setValue("collectorName", `${currentBarangayData.user.firstName} ${currentBarangayData.user.lastName}`)
  }, [currentBarangayData])

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

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-medium">Material</label>
            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11 flex items-center">
              <select
                className="w-full outline-none"
                defaultValue=""
                {...register("programMaterialId")}
                disabled={selectedProgramId === ""}
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
            {errors.programMaterialId && (
              <p className="text-[14px] text-red-500 text-start">
                {errors.programMaterialId?.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-medium">Quantity</label>
            <input
              type="number"
              className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11"
              min={0}
              placeholder="Input quantity here"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-[14px] text-red-500 text-start">
                {errors.quantity?.message}
              </p>
            )}
          </div>
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
          <label className="text-gray-700 font-medium">Collector</label>
          <input
            type="text"
            className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg  transition-colors min-h-11 max-h-11 bg-gray-100 cursor-default"
            placeholder="Input collectors' name here"
            readOnly
            value={currentBarangayData ? `${currentBarangayData.user.firstName} ${currentBarangayData.user.lastName}` : "Loading..."}
            {...register("collectorName")}
          />
          {errors.collectorName && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.collectorName?.message}
            </p>
          )}
        </div>

      
      </div>
    </Modal>
  );
};
