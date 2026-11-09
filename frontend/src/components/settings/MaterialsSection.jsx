"use client";

import { SectionHeader } from "../ui/SectionHeader";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { CubeIcon } from "@heroicons/react/24/outline";
import { AddMaterialModal } from "@/components/settings/modals/AddMaterialModal";
import { EditMaterialModal } from "@/components/settings/modals/EditMaterialModal";
import { useFetch } from "@/hooks/useFetch";
import { Empty } from "@/components/ui/Empty";
import { MaterialTag } from "../ui/MaterialTag";
import { Spinner } from "../ui/Spinner";
import Skeleton from "react-loading-skeleton";
import { Error } from "../ui/Error";

const MATERIALS_TABLE_HEADERS = ["Category", "Material Name", "Unit", "Action"];

export const MaterialsSection = () => {
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Materials section
  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    isError: isMaterialsError,
  } = useFetch({
    url: "/api/material/barangay",
    refetchCount: materialRefetchCount,
  });
  const handleMaterialRefetchCount = () =>
    setMaterialRefetchCount((prev) => prev + 1);

  const materialsByCategory = (materialsData?.materials ?? []).reduce(
    (acc, material) => {
      const categoryName = material?.category?.name ?? "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(material);
      return acc;
    },
    [],
  );

  const materials = Object.entries(materialsByCategory);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Materials"
        subtitle="Manage recyclable materials accepted by your barangay"
        icon={<CubeIcon className="w-6 stroke-accent" />}
        buttonLabel="Add Material"
        onAction={() => setIsAddMaterialModalOpen(true)}
      />

      {/* Desktop table */}
      <Card
        className={`hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse text-gray-600">
            <thead className="border-b border-border">
              <tr>
                {MATERIALS_TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="font-medium text-start p-4 text-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isMaterialsLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIALS_TABLE_HEADERS.length}>
                    <Spinner />
                  </td>
                </tr>
              ) : isMaterialsError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIALS_TABLE_HEADERS.length}>
                    <Error
                      handleRefetchCount={handleMaterialRefetchCount}
                      subtext={"Unable to get your materials. Please try again"}
                    />
                  </td>
                </tr>
              ) : Object.keys(materialsByCategory).length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={MATERIALS_TABLE_HEADERS.length}>
                    <Empty
                      text={"No materials yet"}
                      subtext={
                        "No materials found. Press the add material button above to add one."
                      }
                    />
                  </td>
                </tr>
              ) : (
                materials?.flatMap(([categoryName, materialsInCategory]) =>
                  materialsInCategory?.map((material) => (
                    <tr
                      key={material.id}
                      className="hover:bg-bg transition-all duration-150"
                    >
                      <td className="p-4 text-nowrap">
                        <MaterialTag type={categoryName} />
                      </td>
                      <td className="p-4 font-medium text-text-primary text-nowrap">
                        <MaterialTag
                          type={categoryName}
                          materialName={material.name}
                          textOnly={true}
                        />
                      </td>
                      <td className="p-4 text-nowrap lowercase">
                        {material.defaultUnit === "PIECE"
                          ? "pcs"
                          : material.defaultUnit}
                      </td>
                      <td className="p-4">
                        <button
                          className="text-accent hover:underline"
                          onClick={() => setEditingMaterial(material)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )),
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="flex md:hidden flex-col gap-3">
        {isMaterialsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton width={120} />
              <div className="flex flex-col gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card
                    key={i}
                    className="flex flex-row items-center justify-between shadow-none! new-border"
                  >
                    <Skeleton width={135} />
                    <Skeleton width={25} />
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : isMaterialsError ? (
          <Error
            handleRefetchCount={handleMaterialRefetchCount}
            subtext={"Unable to get your materials. Please try again"}
          />
        ) : Object.keys(materialsByCategory).length === 0 ? (
          <Empty
            text={"No materials yet"}
            subtext={
              "No materials found. Press the add material button above to add one."
            }
          />
        ) : (
          materials?.flatMap(([categoryName, materialsByCategory]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {categoryName}
              </p>
              <div className="flex flex-col gap-2">
                {materialsByCategory?.map((material) => (
                  <Card
                    key={material.id}
                    className="flex flex-row items-center justify-between shadow-none! new-border"
                  >
                    <MaterialTag
                      materialName={material.name}
                      type={categoryName}
                      textOnly={true}
                    />

                    <div className="flex flex-row items-center gap-3">
                      <p className="text-xs text-gray-500 lowercase">
                        {material.defaultUnit === "PIECE"
                          ? "pcs"
                          : material.defaultUnit}
                      </p>
                      <button
                        className="text-xs text-accent font-medium new-border px-3 py-1.5 rounded-xl"
                        onClick={() => setEditingMaterial(material)}
                      >
                        Edit
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        setIsModalOpen={setIsAddMaterialModalOpen}
        handleMaterialRefetchCount={handleMaterialRefetchCount}
      />
      {editingMaterial && (
        <EditMaterialModal
          key={editingMaterial.id}
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          handleMaterialRefetchCount={handleMaterialRefetchCount}
        />
      )}
    </section>
  );
};
