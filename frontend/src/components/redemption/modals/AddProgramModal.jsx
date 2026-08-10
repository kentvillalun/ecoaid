"use client";

import { Modal } from "@/components/ui/Modal";
import { GiftIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const { makeRequest } = useMutation();
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

  // Group materials by whatever category names actually exist in the DB.
  // No hardcoded category list here — add/rename/remove a category in the
  // backend and this picks it up automatically, no code change needed.
  const materialsByCategory = (materialsData?.materials ?? []).reduce(
    (acc, material) => {
      const categoryName = material?.category?.name ?? "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(material);
      return acc;
    },
    {},
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

  // A material is toggled by clicking anywhere on its card. The input
  // itself stops the click from bubbling up (otherwise clicking into the
  // number field would immediately re-toggle the card off).
  const toggleMaterial = (materialId) => {
    const isCurrentlyChecked = materialState[materialId]?.isChecked ?? false;
    setMaterialState({
      ...materialState,
      [materialId]: {
        ...materialState[materialId],
        isChecked: !isCurrentlyChecked,
        value: isCurrentlyChecked ? "" : materialState[materialId]?.value,
      },
    });
  };

  // One reusable card — used to be a checkbox+row copy-pasted 4x (once
  // per hardcoded category). Same underlying state shape as before
  // (isChecked/value keyed by materialId), just a different UI on top:
  // unselected = plain outline card, selected = accent-filled card with
  // the value input revealed inline instead of shown-but-disabled.
  const renderMaterialCard = (material) => {
    const isChecked = materialState[material.id]?.isChecked ?? false;

    return (
      <div
        key={material.id}
        onClick={() => toggleMaterial(material.id)}
        className={`flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
          isChecked
            ? "bg-white border-accent"
            : "bg-white border-border hover:border-accent/40"
        }`}
      >
        <div className="flex flex-row items-center justify-between gap-2">
          <span
            className={`text-sm ${isChecked ? "text-accent font-medium" : "text-text-primary"}`}
          >
            {material.name}
          </span>
          {isChecked ? (
            <XMarkIcon className="w-4 h-4 stroke-accent shrink-0" />
          ) : (
            <PlusIcon className="w-4 h-4 stroke-text-secondary shrink-0" />
          )}
        </div>

        {isChecked && (
          <div
            className="flex flex-row items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="number"
              min={0}
              className="input mb-0 w-full"
              placeholder="0"
              value={materialState[material.id]?.value ?? ""}
              onChange={(e) => {
                setMaterialState({
                  ...materialState,
                  [material.id]: {
                    ...materialState[material.id],
                    value: e.target.value,
                  },
                });
              }}
            />
            <span className="text-xs text-accent">
              {isCashMode === "true" || isCashMode === true
                ? `₱/${material.defaultUnit.toLowerCase()}`
                : `pts/${material.defaultUnit.toLowerCase()}`}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryColumn = (categoryName, materials) => (
    <div className="flex flex-col gap-2" key={categoryName}>
      <label className="pr-6 text-text-primary capitalized">
        {categoryName}
      </label>
      <div className="flex flex-col gap-2">
        {materials.map(renderMaterialCard)}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isProgramModalOpen}
      onClose={() => setIsProgramModalOpen(false)}
      icon={<GiftIcon className="w-6 stroke-accent" />}
      title={program ? "Edit Program" : "Create Program"}
      subtitle={
        program
          ? "Update program details and material point values"
          : "Please input basic details about the program"
      }
      confirmLabel={program ? "Edit Program" : "Create Program"}
      confirmClassName={
        "gradient-button transition-all duration-200 ease-in-out"
      }
      onConfirm={() => handleSubmit(onSubmit)()}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">Program name</label>
          <input
            type="text"
            className="input mb-0"
            placeholder="Input the program name here"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 text-start">
              {errors.name?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">
            Program description
          </label>
          <textarea
            type="text"
            className="input mb-0 max-h-none"
            placeholder="Input a short description about the program"
            {...register("description")}
            rows={4}
          ></textarea>
          {errors.description && (
            <p className="text-xs text-red-500 text-start">
              {errors.description?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-text-primary font-medium">Redemption mode</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="radio"
              className="hidden"
              id="reward"
              {...register("isCashMode")}
              value={false}
            />
            <label
              className={`flex flex-col gap-1 py-2.5 px-3.5 text-gray-400 rounded-lg border transition-colors min-h-11 bg-white ${isCashMode === "false" || isCashMode === false ? "border-accent" : "border-border"}`}
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
              className={`flex flex-col gap-1 py-2.5 px-3.5 text-gray-400 rounded-lg border focus-within:outline-accent transition-colors min-h-11 bg-white ${isCashMode === "true" || isCashMode === true ? "border-accent" : "border-border"}`}
              htmlFor="cash"
            >
              <p className=" text-sm font-medium">Cash</p>
              <p className=" text-sm">Receive cash for materials</p>
            </label>
          </div>
        </div>

        <div className={`grid gap-3 grid-cols-1`}>
          <div className="flex flex-col gap-1 ">
            <label className="text-text-primary font-medium">Allotted budget</label>
            <input
              type="number"
              className="input mb-0"
              placeholder="Input budget here"
              {...register("allotedBudget")}
            />
            {errors.allotedBudget && (
              <p className="text-xs text-red-500 text-start">
                {errors.allotedBudget?.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="">
            <label className="text-text-primary font-medium">
              {isCashMode === true || isCashMode === "true"
                ? "Materials and cash values"
                : "Materials and point values"}
            </label>
            <p className="text-text-primary text-sm">
              {isCashMode === true || isCashMode === "true"
                ? "Select materials to include and assign cash values. "
                : "Select materials to include and assign point values. "}
            </p>
          </div>

          {/* Was 4 copy-pasted checkbox-row blocks (Plastics/Metals/Papers/
              Bottles). Now renders one column per category that actually
              exists in materialsData, with clickable cards instead of
              checkbox rows — the input only appears once a material is
              selected, instead of showing a disabled input for every
              unselected material. Adding "Glass" (or any future category)
              in the backend shows up here automatically. */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3 md:gap-5">
            {Object.entries(materialsByCategory).map(([categoryName, materials]) =>
              renderCategoryColumn(categoryName, materials),
            )}
          </div>

          {errors.materials && (
            <p className="text-xs text-red-500 text-start">
              {errors.materials?.message}
            </p>
          )}
          <p className="text-gray-700 text-sm mt-3">
            <span className="font-medium">Note: </span>
            {program
              ? "Deselect a material to remove it from the program, or update its value to change it."
              : "Materials left unselected won't be included in your program."}
          </p>
        </div>

        {program && (
          <div className="w-full flex flex-col gap-2 mt-5">
            {isConfirming ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer"
                  type="button"
                  onClick={() => setIsConfirming((prev) => !prev)}
                >
                  Cancel
                </button>
                <button
                  className={`py-2.5 rounded-lg text-white w-full items-center justify-center hover:cursor-pointer transition-all duration-200 ease-in-out ${program?.isActive ? "gradient-button-red" : "gradient-button"}`}
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
                className={`py-2.5 rounded-lg text-white w-full items-center justify-center hover:cursor-pointer transition-all duration-200 ease-in-out ${program?.isActive ? "gradient-button-red" : "gradient-button"}`}
                type="button"
                onClick={() => setIsConfirming((prev) => !prev)}
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
