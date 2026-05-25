"use client";

import { Modal } from "@/components/ui/Modal";
import { GiftIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";

const schema = yup.object().shape({
  name: yup.string().required("Program name is required"),
  allotedBudget: yup
    .number("Please input a number only")
    .nullable()
    .required("Budget is required"),
  materials: yup
    .object()
    .test(
      "at-least-one",
      "Please check and assign at least one material point value",
      (value) =>
        Object.values(value).some(
          (v) =>
            v?.isChecked === true &&
            v?.value !== null &&
            v?.value !== undefined &&
            v?.value !== "",
        ),
    ),
  description: yup.string().required("Decription is required"),
  isCashMode: yup.boolean().required(),
});

export const AddProgramModal = ({
  isProgramModalOpen,
  setIsProgramModalOpen,
  setRefetchCount,
  program,
  id,
}) => {
  const { makeRequest, isLoading, data, error, isError } = useMutation();
  const url = program
    ? `/api/redemption/programs/${id}`
    : "/api/redemption/programs";

  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const { data: materialsData } = useFetch({
    url: `/api/material/barangay`,
    refetchCount: materialRefetchCount,
  });

  const [isConfirming, setIsConfirming] = useState(false);

  const [materialState, setMaterialState] = useState({});

  const papers = materialsData?.materials?.filter(
    (m) => m.category.name === "Papers",
  );
  const metals = materialsData?.materials?.filter(
    (m) => m.category.name === "Metals",
  );
  const plastics = materialsData?.materials?.filter(
    (m) => m?.category?.name === "Plastics",
  );
  const bottles = materialsData?.materials?.filter(
    (m) => m.category.name === "Bottles",
  );

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: program?.name ?? "",
      allotedBudget: program?.allotedBudget ?? null,
      materials: {} ?? "",
      description: program?.description ?? "",
      isCashMode: program?.isCashMode ?? false,
    },
  });

  const isCashMode = watch("isCashMode");

  const onSubmit = async (formData) => {
    const programMaterial = Object.entries(materialState)
      .filter((f) => {
        return f[1]?.isChecked === true;
      })
      .map(([key, value]) =>
        isCashMode === "true" || isCashMode === true
          ? { materialId: key, cashValue: parseFloat(value.value) }
          : { materialId: key, pointValue: parseFloat(value.value) },
      );

    const materials = program
      ? Object.entries(materialState)
          .filter(([_, v]) => v?.isChecked === true && v?.value !== "")
          .map(([key, value]) =>
            isCashMode === "true" || isCashMode === true
              ? { materialId: key, cashValue: parseFloat(value.value) }
              : { materialId: key, pointValue: parseFloat(value.value) },
          )
      : null;

    toast.loading(program ? "Updating program" : "Creating program");
    const success = await makeRequest({
      url,
      method: program ? "PATCH" : "POST",
      body: {
        name: formData.name,
        allotedBudget: formData.allotedBudget,
        description: formData.description,
        isCashMode:
          formData.isCashMode === true || formData.isCashMode === "true",
        ...(program ? { materials } : { programMaterial }),
      },
    });

    if (success) {
      toast.dismiss();
      toast.success(program ? "Program updated" : "Program created");
      setIsProgramModalOpen(false);
      setRefetchCount((prev) => prev + 1);
      reset();
    } else {
      toast.dismiss();
      toast.error(
        program ? "Updating program failed" : "Creating program failed",
      );
    }
  };

  useEffect(() => {
    if (!program) return;

    reset({
      name: program.name,
      description: program.description,
      allotedBudget: program.allotedBudget,
    });
  }, [program]);

  useEffect(() => {
    if (!program) {
      if (!materialsData?.materials) return;
      setMaterialState(
        Object.fromEntries(
          materialsData.materials.map((m) => [
            m.id,
            { isChecked: false, value: "" },
          ]),
        ),
      );
    } else {
      if (!materialsData?.materials) return;
      setMaterialState({
        ...Object.fromEntries(
          materialsData.materials.map((m) => [
            m.id,
            { isChecked: false, value: "" },
          ]),
        ),
        ...Object.fromEntries(
          program.programMaterial.map((m) => [
            m.materialId,
            { isChecked: true, value: m.pointValue ?? m.cashValue },
          ]),
        ),
      });
    }
  }, [materialsData]);

  useEffect(() => {
    setValue("materials", materialState);
  }, [materialState]);

  return (
    <Modal
      isOpen={isProgramModalOpen}
      onClose={() => setIsProgramModalOpen(false)}
      icon={<GiftIcon className="w-6 stroke-black" />}
      title={program ? "Edit Program" : "Create Program"}
      subtitle={
        program
          ? "Update program details and material point values"
          : "Please input basic details about the program"
      }
      confirmLabel={program ? "Edit Program" : "Create Program"}
      confirmClassName={
        "bg-[#74C857] hover:bg-primary transition-all duration-200 ease-in-out"
      }
      onConfirm={() => handleSubmit(onSubmit)()}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Program name</label>
          <input
            type="text"
            className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11"
            placeholder="Input the program name here"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.name?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">
            Program description
          </label>
          <textarea
            type="text"
            className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors"
            placeholder="Input a short description about the program"
            {...register("description")}
            rows={4}
          ></textarea>
          {errors.description && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.description?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">Redemption mode</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="radio"
              className="hidden"
              id="reward"
              {...register("isCashMode")}
              value={false}
            />
            <label
              className={`flex flex-col gap-1 outline-1 py-2.5 px-3.5  text-gray-400 rounded-lg outline-gray-300 transition-colors min-h-11 ${isCashMode === "false" || isCashMode === false ? "bg-gray-100 " : ""}`}
              htmlFor="reward"
            >
              <p className=" text-sm font-medium">Points</p>
              <p className=" text-sm">Earn points to redeem rewards</p>
            </label>
            <input
              type="radio"
              className="hidden"
              id="cash"
              {...register("isCashMode")}
              value={true}
            />
            <label
              className={`flex flex-col gap-1 outline-1 py-2.5 px-3.5 text-gray-400 outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11 ${isCashMode === "true" || isCashMode === true ? "bg-gray-100 " : ""}`}
              htmlFor="cash"
            >
              <p className=" text-sm font-medium">Cash</p>
              <p className=" text-sm">Receive cash for materials</p>
            </label>
          </div>
        </div>

        <div
          className={`grid gap-3 grid-cols-1`}
        >
          <div className="flex flex-col gap-1 ">
            <label className="text-gray-700 font-medium">Allotted budget</label>
            <input
              type="number"
              className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11"
              placeholder="Input budget here"
              {...register("allotedBudget")}
            />
            {errors.allotedBudget && (
              <p className="text-[14px] text-red-500 text-start">
                {errors.allotedBudget?.message}
              </p>
            )}
          </div>
          
        </div>

        <div className="flex flex-col gap-1">
          <div className="">
            <label className="text-gray-700 font-medium">
              {isCashMode === true || isCashMode === "true"
                ? "Materials and cash values"
                : "Materials and point values"}
            </label>
            <p className="text-gray-700 text-sm">
              {isCashMode === true || isCashMode === "true"
                ? "Check materials to include and assign cash values. "
                : "Check materials to include and assign point values. "}
            </p>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-3 md:gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="pr-6 text-gray-400 capitalized"
                htmlFor="plastics"
              >
                Plastics
              </label>
              <div className="flex flex-col gap-2">
                {plastics?.map((p) => (
                  <div
                    className={`flex flex-row justify-between items-center gap-3  ${materialState[p.id]?.isChecked ? "opacity-100" : "opacity-40"}`}
                    key={p.id}
                  >
                    <input
                      type="checkbox"
                      checked={materialState[p.id]?.isChecked ?? false}
                      onChange={(e) => {
                        setMaterialState({
                          ...materialState,
                          [p.id]: {
                            ...materialState[p.id],
                            isChecked: e.target.checked,
                            value: !e.target.checked
                              ? ""
                              : materialState[p.id]?.value,
                          },
                        });
                      }}
                    />

                    <div
                      className="flex flex-row items-center justify-between flex-1 outline-1 py-2.5 px-3.5 rounded-lg text-[#717680] outline-gray-300 focus-within:outline-[#74C857]"
                      onClick={(e) =>
                        e.currentTarget.querySelector("input")?.focus()
                      }
                    >
                      <label className="text-gray-700 w-auto text-sm">
                        {p.name}
                      </label>

                      <div className="flex flex-row gap-2 items-center">
                        <input
                          type="number"
                          className="outline-none max-w-20 z-50"
                          min={0}
                          disabled={!materialState[p.id]?.isChecked ?? false}
                          value={materialState[p.id]?.value ?? ""}
                          onChange={(e) => {
                            setMaterialState({
                              ...materialState,
                              [p.id]: {
                                ...materialState[p.id],
                                value: e.target.value,
                              },
                            });
                          }}
                        />

                        <p className="text-gray-700 text-sm">
                          {isCashMode === "true" || isCashMode === true
                            ? `₱/${p.defaultUnit.toLowerCase()}`
                            : `pts/${p.defaultUnit.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="pr-6 text-gray-400 capitalized"
                htmlFor="plastics"
              >
                Metals
              </label>
              <div className="flex flex-col gap-2">
                {metals?.map((p) => (
                  <div
                    className={`flex flex-row justify-between items-center gap-3 ${materialState[p.id]?.isChecked ? "opacity-100" : "opacity-40"}`}
                    key={p.id}
                  >
                    <input
                      type="checkbox"
                      checked={materialState[p.id]?.isChecked ?? false}
                      onChange={(e) => {
                        setMaterialState({
                          ...materialState,
                          [p.id]: {
                            ...materialState[p.id],
                            isChecked: e.target.checked,
                            value: !e.target.checked
                              ? ""
                              : materialState[p.id]?.value,
                          },
                        });
                      }}
                    />

                    <div
                      className="flex flex-row items-center justify-between flex-1 outline-1 py-2.5 px-3.5 rounded-lg text-[#717680] outline-gray-300 focus-within:outline-[#74C857]"
                      onClick={(e) =>
                        e.currentTarget.querySelector("input")?.focus()
                      }
                    >
                      <label className="text-gray-700 w-auto text-sm">
                        {p.name}
                      </label>

                      <div className="flex flex-row gap-2 items-center">
                        <input
                          type="number"
                          className="outline-none max-w-20 z-50"
                          min={0}
                          disabled={!materialState[p.id]?.isChecked ?? false}
                          value={materialState[p.id]?.value ?? ""}
                          onChange={(e) => {
                            setMaterialState({
                              ...materialState,
                              [p.id]: {
                                ...materialState[p.id],
                                value: e.target.value,
                              },
                            });
                          }}
                        />

                        <p className="text-gray-700 text-sm">
                          {isCashMode === "true" || isCashMode === true
                            ? `₱/${p.defaultUnit.toLowerCase()}`
                            : `pts/${p.defaultUnit.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="pr-6 text-gray-400 capitalized"
                htmlFor="plastics"
              >
                Papers
              </label>
              <div className="flex flex-col gap-2">
                {papers?.map((p) => (
                  <div
                    className={`flex flex-row justify-between items-center gap-3 ${materialState[p.id]?.isChecked ? "opacity-100" : "opacity-40"}`}
                    key={p.id}
                  >
                    <input
                      type="checkbox"
                      checked={materialState[p.id]?.isChecked ?? false}
                      onChange={(e) => {
                        setMaterialState({
                          ...materialState,
                          [p.id]: {
                            ...materialState[p.id],
                            isChecked: e.target.checked,
                            value: !e.target.checked
                              ? ""
                              : materialState[p.id]?.value,
                          },
                        });
                      }}
                    />

                    <div
                      className="flex flex-row items-center justify-between flex-1 outline-1 py-2.5 px-3.5 rounded-lg text-[#717680] outline-gray-300 focus-within:outline-[#74C857]"
                      onClick={(e) =>
                        e.currentTarget.querySelector("input")?.focus()
                      }
                    >
                      <label className="text-gray-700 w-auto text-sm">
                        {p.name}
                      </label>

                      <div className="flex flex-row gap-2 items-center">
                        <input
                          type="number"
                          className="outline-none max-w-20 z-50"
                          min={0}
                          disabled={!materialState[p.id]?.isChecked ?? false}
                          value={materialState[p.id]?.value ?? ""}
                          onChange={(e) => {
                            setMaterialState({
                              ...materialState,
                              [p.id]: {
                                ...materialState[p.id],
                                value: e.target.value,
                              },
                            });
                          }}
                        />

                        <p className="text-gray-700 text-sm">
                          {isCashMode === "true" || isCashMode === true
                            ? `₱/${p.defaultUnit.toLowerCase()}`
                            : `pts/${p.defaultUnit.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="pr-6 text-gray-400 capitalized"
                htmlFor="plastics"
              >
                Bottles
              </label>
              <div className="flex flex-col gap-2">
                {bottles?.map((p) => (
                  <div
                    className={`flex flex-row justify-between items-center gap-3 ${materialState[p.id]?.isChecked ? "opacity-100" : "opacity-40"}`}
                    key={p.id}
                  >
                    <input
                      type="checkbox"
                      checked={materialState[p.id]?.isChecked ?? false}
                      onChange={(e) => {
                        setMaterialState({
                          ...materialState,
                          [p.id]: {
                            ...materialState[p.id],
                            isChecked: e.target.checked,
                            value: !e.target.checked
                              ? ""
                              : materialState[p.id]?.value,
                          },
                        });
                      }}
                    />

                    <div
                      className="flex flex-row items-center justify-between flex-1 outline-1 py-2.5 px-3.5 rounded-lg text-[#717680] outline-gray-300 focus-within:outline-[#74C857]"
                      onClick={(e) =>
                        e.currentTarget.querySelector("input")?.focus()
                      }
                    >
                      <label className="text-gray-700 w-auto text-sm ">
                        {p.name}
                      </label>

                      <div className="flex flex-row gap-2 items-center">
                        <input
                          type="number"
                          className="outline-none max-w-20 z-50"
                          min={0}
                          disabled={!materialState[p.id]?.isChecked ?? false}
                          value={materialState[p.id]?.value ?? ""}
                          onChange={(e) => {
                            setMaterialState({
                              ...materialState,
                              [p.id]: {
                                ...materialState[p.id],
                                value: e.target.value,
                              },
                            });
                          }}
                        />

                        <p className="text-gray-700 text-sm">
                          {isCashMode === "true" || isCashMode === true
                            ? `₱/${p.defaultUnit.toLowerCase()}`
                            : `pts/${p.defaultUnit.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {errors.materials && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.materials?.message}
            </p>
          )}
          <p className="text-gray-700 text-sm mt-3">
            <span className="font-medium">Note: </span>
            {program
              ? "Uncheck a material to remove it from the program, or update its value to change it."
              : "Please leave the material unchecked if you don't want to include it in your program"}
          </p>
        </div>

        {program && (
          <div className="w-full flex flex-col gap-2 mt-5">
            {isConfirming ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer"
                  type="button" onClick={() => setIsConfirming(prev => !prev)}
                >
                  Cancel
                </button>
                <button
                  className={`py-2.5 rounded-lg text-white w-full items-center justify-center hover:cursor-pointer transition-all duration-200 ease-in-out ${program?.isActive ? "bg-red-400 hover:bg-red-500" : "bg-[#74C857] hover:bg-primary"}`}
                  type="button"
                  onClick={async () => {
                    toast.loading(
                      program?.isActive
                        ? "Deactivating program"
                        : "Reactivating program",
                    );

                    const success = await makeRequest({
                      url,
                      method: "PATCH",
                      body: {
                        isActive: program?.isActive ? false : true,
                      },
                    });

                    if (success) {
                      toast.dismiss();
                      toast.success(
                        program?.isActive
                          ? "Program deactivated"
                          : "Program reactivated",
                      );
                      setIsProgramModalOpen(false);
                      setRefetchCount((prev) => prev + 1);
                      reset();
                    } else {
                      toast.dismiss();
                      toast.error(
                        program?.isActive
                          ? "Deactivation failed"
                          : "Reactivation failed",
                      );
                    }
                  }}
                >
                  {program?.isActive ? "Yes, deactivate" : "Yes, reactivate"}
                </button>
              </div>
            ) : (
              <button
                className={`py-2.5 rounded-lg text-white w-full items-center justify-center hover:cursor-pointer transition-all duration-200 ease-in-out ${program?.isActive ? "bg-red-400 hover:bg-red-500" : "bg-[#74C857] hover:bg-primary"}`} type="button" onClick={() => setIsConfirming(prev => !prev)}
              >
                {program?.isActive ? "Deactivate Program" : "Reactivate Program"}
              </button>
            )}

            {program?.isActive ? (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Caution: </span>This action will
                deactivate the program. Existing transactions will not be
                affected
              </p>
            ) : (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Note: </span>Reactivating this
                program will allow new transactions to be recorded under it
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
