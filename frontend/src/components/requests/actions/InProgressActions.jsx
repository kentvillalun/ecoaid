import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ScaleIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdate } from "@/hooks/useUpdate";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";

export const InProgressActions = ({
  id,
  onSuccess,
  variant,
  materialType,
  material,
  isAssorted,
  categories,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualValue, setActualValue] = useState(null);
  const [actualUnit, setActualUnit] = useState("KG");
  const { updateStatus } = useUpdate();
  const [materialOptions, setMaterialOptions] = useState([[], []]);

  const [items, setItems] = useState([
    { categoryId: "", materialId: "", actualValue: "", actualUnit: "KG" },
    { categoryId: "", materialId: "", actualValue: "", actualUnit: "KG" },
  ]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      { categoryId: "", materialId: "", actualValue: "", actualUnit: "" },
    ]);
    setMaterialOptions([...materialOptions, []]);
  };

  const removeRow = (index) => {
    const removed = items.filter((item, i) => i !== index);
    setItems(removed);
  };

  const handleAssortedConfirm = async () => {
    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      items,
    });

    if (success) {
      toast.dismiss();
      toast.success("Record finalize! Request collected!");
      setIsOpen(false);
      onSuccess();
    } else {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  const handleSimpleConfirm = async () => {
    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      items: [{ materialId: material.id, actualValue, actualUnit }],
    });
 
    if (success) {
      toast.dismiss();
      toast.success("Record finalize! Request collected!");
      setIsOpen(false);
      onSuccess();
    } else {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  const handleCategoryChange = async (index, categoryId) => {
    updateItem(index, "categoryId", categoryId);

    const response = await fetch(`/api/material?categoryId=${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    const updated = [...materialOptions];
    updated[index] = result.materials;
    setMaterialOptions(updated);
  };

  return (
    <div
      className={` ${variant === "detail" ? "grid grid-cols-1 w-full" : "flex items-center gap-3 text-sm"}`}
    >
      {isOpen &&
        createPortal(
          <Modal
            isOpen={isOpen}
            title={"Finalize Record"}
            subtitle={"Please input the actual weight of the recyclable"}
            icon={<ScaleIcon className="w-6 stroke-black" />}
            status={"IN_PROGRESS"}
            confirmLabel={"Confirm"}
            confirmClassName={
              "bg-[#74C857] hover:bg-primary transition-all duration-200 ease-in-out"
            }
            onClose={() => {
              setIsOpen(false);
              setItems([
                {
                  categoryId: "",
                  materialId: "",
                  actualValue: "",
                  actualUnit: "KG",
                },
                {
                  categoryId: "",
                  materialId: "",
                  actualValue: "",
                  actualUnit: "KG",
                },
              ]);
            }}
            onConfirm={
              isAssorted === true ? handleAssortedConfirm : handleSimpleConfirm
            }
            isPill={true}
          >
            {isAssorted === true ? (
              <div className="flex flex-col md:gap-4 gap-7 p-6 ">
                {/* <div className="outline-1 py-2.5 pl-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex items-center justify-between"> */}
                {/* </div> */}
                {/* Labels */}

                <div className="md:grid w-full grid-cols-3 gap-2 hidden">
                  <label className="font-medium text-sm text-[#727272] px-2">
                    Category
                  </label>{" "}
                  <label className="font-medium text-sm text-[#727272] px-2">
                    Material
                  </label>{" "}
                  <label className="font-medium text-sm text-[#727272] px-2">
                    Actual value and unit
                  </label>{" "}
                  
                </div>

                {/* Fields */}
                <div className="flex flex-col md:gap-2 gap-6">
                  {items.map((item, index) => (
                    <div
                      className="grid md:grid-cols-3 grid-cols-1 pr-2 md:gap-2 gap-1"
                      key={index}
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-semibol md:hidden">
                          Category
                        </label>
                        <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors">
                          <select
                            className="w-full outline-none"
                            onChange={(e) =>
                              handleCategoryChange(index, e.target.value)
                            }
                            value={item.categoryId}
                          >
                            <option value="" disabled hidden>
                              Category
                            </option>
                            {categories?.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-semibol md:hidden">
                          Material name
                        </label>
                        <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors">
                          <select
                            className="w-full outline-none"
                            onChange={(e) =>
                              updateItem(index, "materialId", e.target.value)
                            }
                            disabled={!item.categoryId}
                            value={item.materialId}
                          >
                            <option value="" disabled hidden>
                              Material
                            </option>
                            {materialOptions[index]?.map((m) => (
                              <option value={m.id} key={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className=" gap-2 grid grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-700 font-semibol md:hidden">
                            Actual value
                          </label>
                          <input
                            type="number"
                            className=" focus-within:outline-[#74C857] px-2 py-2.5 rounded-lg outline-1 outline-gray-300 transition-colors"
                            placeholder="e.g. 1"
                            min={0}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "actualValue",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-gray-700 font-semibol md:hidden">
                            Actual value
                          </label>

                          <div className="flex flex-row items-center gap-4">
                            <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex-1">
                              <select
                                className="w-full outline-none"
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "actualUnit",
                                    e.target.value,
                                  )
                                }
                                value={item.actualUnit}
                              >
                                <option value="" hidden disabled>
                                  kg
                                </option>
                                <option value="KG">kg</option>
                                <option value="GRAMS">grams</option>
                                <option value="LBS">lbs</option>
                                <option value="PIECE">piece/s</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              disabled={items.length === 2}
                              className="hover:cursor-pointer"
                            >
                              <TrashIcon className="w-6 stroke-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer"
                  onClick={addRow}
                  type="button"
                >
                  Add new row
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-6">
                <label className="font-medium text-sm text-[#727272] px-2">
                  Actual Value
                </label>
                <div className="outline-1 py-2.5 pl-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex items-center justify-between">
                  <div className="flex flex-row justify-center items-center w-full pr-4">
                    <input
                      type="number"
                      className="outline-none w-full"
                      placeholder="e.g. 1"
                      min={0}
                      onChange={(event) => {
                        const value = parseFloat(event.target.value);
                        setActualValue(value);
                      }}
                    />
                    <select
                      className="outline-none"
                      onChange={(event) => setActualUnit(event.target.value)}
                      value={actualUnit}
                    >
                      <option value="" hidden disabled>
                        kg
                      </option>
                      <option value="KG">kg</option>
                      <option value="GRAMS">grams</option>
                      <option value="LBS">lbs</option>
                      <option value="PIECE">piece/s</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Modal>,
          document.body,
        )}

      <button
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-lg hover:cursor-pointer hover:bg-primary bg-[#74C857] transition-all duration-200 ease-in-out" : "text-green-600 hover:underline"}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Complete
      </button>
    </div>
  );
};
