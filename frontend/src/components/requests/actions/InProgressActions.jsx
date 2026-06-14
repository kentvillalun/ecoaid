import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ScaleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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

    const response = await fetch(`/api/material/barangay?categoryId=${categoryId}`, {
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
              "gradient-button transition-all duration-200 ease-in-out "
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
              <div className="flex flex-col gap-3 p-6">
                {items.map((item, index) => (
                  <div key={index} className="new-border bg-white rounded-xl p-4">
                    <div className="flex flex-row items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Material {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={items.length === 2}
                        className="hover:cursor-pointer"
                      >
                        <XMarkIcon className="w-5 stroke-gray-400" />
                      </button>
                    </div>

                    <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2">
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

                    <div className="w-full outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 mb-2">
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

                    <div className="flex flex-row gap-2">
                      <div className="flex-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11">
                        <input
                          type="number"
                          className="outline-none w-full"
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
                      <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 min-w-28">
                        <select
                          className="w-full outline-none"
                          onChange={(e) =>
                            updateItem(index, "actualUnit", e.target.value)
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
                    </div>
                  </div>
                ))}

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
                <label className="font-medium text-base text-text-primary px-2">
                  Actual Value
                </label>
                <div className="outline-1 py-2.5 pl-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors flex items-center justify-between">
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
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button transition-all duration-200 ease-in-out" : "text-green-600 hover:underline"}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Complete
      </button>
    </div>
  );
};
