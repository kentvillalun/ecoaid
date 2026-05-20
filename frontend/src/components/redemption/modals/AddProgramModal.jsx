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
  maxPoints: yup
    .number("Please input a number only")
    .nullable()
    .required("Maximum points is required"),
  materials: yup
    .object()
    .test(
      "at-least-one",
      "Please assign at least one material point value",
      (value) =>
        Object.values(value).some(
          (v) => v !== "" && v !== null && v !== undefined,
        ),
    ),
  description: yup.string().required("Decription is required"),
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
    url: `/api/material/`,
    refetchCount: materialRefetchCount,
  });

  const papers = materialsData?.materials?.filter((m) => m.category.name === "Papers")
  const metals = materialsData?.materials?.filter((m) => m.category.name === "Metals")
  const plastics = materialsData?.materials?.filter((m) => m.category.name === "Plastics")
  const bottles = materialsData?.materials?.filter((m) => m.category.name === "Bottles")

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: program?.name ?? "",
      allotedBudget: program?.allotedBudget ?? null,
      maxPoints: program?.maxPoints ?? null,
      materials: {} ?? "",
      description: program?.description ?? "",
    },
  });

  const onSubmit = async (formData) => {
    const programMaterial = Object.entries(formData.materials)
      .filter((f) => {
        return f[1] !== "";
      })
      .map(([key, value]) => ({
        materialType: key,
        pointValue: parseFloat(value),
      }));

    const materials = program
      ? Object.fromEntries(
          Object.entries(formData.materials).filter(
            ([_, v]) => v !== "" && v !== null,
          ),
        )
      : null;

    toast.loading(program ? "Updating program" : "Creating program");
    const success = await makeRequest({
      url,
      method: program ? "PATCH" : "POST",
      body: {
        name: formData.name,
        allotedBudget: formData.allotedBudget,
        maxPoints: formData.maxPoints,
        description: formData.description,
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
    if (program) {
      reset({
        name: program.name,
        description: program.description,
        allotedBudget: program.allotedBudget,
        maxPoints: program.maxPoints,
        materials: Object.fromEntries(
          program.programMaterial.map((m) => [
            m.materialType,
            parseFloat(m.pointValue),
          ]),
        ),
      });
    }
  }, [program]);

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

        <div className="grid grid-cols-2 gap-3">
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
          <div className="flex flex-col gap-1 ">
            <label className="text-gray-700 font-medium">Maximum points</label>
            <input
              type="number"
              className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11  max-h-11"
              placeholder="Input max points here"
              {...register("maxPoints")}
            />
            {errors.maxPoints && (
              <p className="text-[14px] text-red-500 text-start">
                {errors.maxPoints?.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="">
            <label className="text-gray-700 font-medium">
              Materials & point values
            </label>
            <p className="text-gray-700 text-sm">
              Check materials to include in this program and assign point
              values.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="">
              <label
                className="pr-6 text-gray-400 uppercase"
                htmlFor="plastics"
              >
                Plastics
              </label>
              <div className="">
                {plastics.map((p) => (
                  <div className="">
                    <input type="checkbox" className="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-3 items-start">
            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex flex-row gap-2 w-full min-h-11  max-h-11">
              <label className="pr-6 text-gray-400" htmlFor="plastics">
                Plastics
              </label>
              <input
                type="number"
                min={0}
                className="w-full outline-none "
                id="plastics"
                placeholder="e.g. 2"
                {...register("materials.PLASTICS")}
              />
            </div>

            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex flex-row gap-3 w-full min-h-11  max-h-11">
              <label className="pr-6 text-gray-400" htmlFor="metals">
                Metals
              </label>
              <input
                type="number"
                min={0}
                className="w-full outline-none"
                id="metals"
                placeholder="e.g. 2"
                {...register("materials.METALS")}
              />
            </div>

            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex flex-row gap-3 w-full min-h-11  max-h-11">
              <label className="pr-6 text-gray-400" htmlFor="bottles">
                Bottles
              </label>
              <input
                type="number"
                min={0}
                className="w-full outline-none"
                id="bottles"
                placeholder="e.g. 2"
                {...register("materials.BOTTLES")}
              />
            </div>

            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex flex-row gap-3 w-full min-h-11  max-h-11">
              <label className="pr-6 text-gray-400" htmlFor="papers">
                Papers
              </label>
              <input
                type="number"
                className="w-full outline-none"
                id="papers"
                min={0}
                placeholder="e.g. 2"
                {...register("materials.PAPERS")}
              />
            </div>
          </div> */}
          {errors.materials && (
            <p className="text-[14px] text-red-500 text-start">
              {errors.materials?.message}
            </p>
          )}
          <p className="text-gray-700 text-sm">
            <span className="font-medium">Note: </span>
            {program
              ? "Leave a material blank to keep its current point value, or enter a new value to update it"
              : "Please leave the field blank if you don't want to assign any points to the material"}
          </p>
        </div>

        {program && (
          <div className="w-full flex flex-col gap-2">
            <button
              className={`py-2.5 rounded-lg text-white mt-5 w-full hover:cursor-pointer transition-all duration-200 ease-in-out ${program?.isActive ? "bg-red-400 hover:bg-red-500" : "bg-[#74C857] hover:bg-primary"}`}
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
              {program?.isActive ? "Deactivate Program" : "Reactivate Program"}
            </button>
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
