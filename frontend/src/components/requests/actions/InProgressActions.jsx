import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ScaleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUpdate } from "@/hooks/useUpdate";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { handleUnauthorized } from "@/lib/handleUnauthorized";

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
  // the resident's choice is only an estimate, the collector decides what was
  // really collected
  const [assorted, setAssorted] = useState(isAssorted === true);
  const [actualValue, setActualValue] = useState(null);
  // starts from the unit the barangay set for the requested material
  const [actualUnit, setActualUnit] = useState(material?.defaultUnit ?? "");
  const { updateStatus } = useUpdate();
  const [materialOptions, setMaterialOptions] = useState([[], []]);

  const [items, setItems] = useState([
    { categoryId: "", materialId: "", actualValue: "", actualUnit: "" },
    { categoryId: "", materialId: "", actualValue: "", actualUnit: "" },
  ]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // picking a material fills in the unit the barangay set for it (still editable)
  const handleItemMaterialChange = (index, materialId) => {
    const defaultUnit = materialOptions[index]?.find(
      (m) => m.id === materialId,
    )?.defaultUnit;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      materialId,
      actualUnit: defaultUnit ?? updated[index].actualUnit,
    };
    setItems(updated);

    // the single form reads its unit from its own state
    if (index === 0 && defaultUnit) setActualUnit(defaultUnit);
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
    const isComplete = items.every(
      (item) => item.materialId && item.actualValue > 0 && item.actualUnit,
    );

    if (!isComplete) {
      return toast.error("Please fill in the material, weight and unit of every row");
    }

    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      items,
      isAssorted: true,
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
    // a request submitted as assorted has no material, so the collector picks
    // one in the first row
    const materialId = material?.id ?? items[0].materialId;

    if (!materialId || !(actualValue > 0) || !actualUnit) {
      return toast.error("Please fill in the material, weight and unit");
    }

    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      items: [{ materialId, actualValue, actualUnit }],
      isAssorted: false,
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

    if (response.status === 401) return handleUnauthorized();

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
            icon={<ScaleIcon className="w-6 stroke-accent" />}
            status={"IN_PROGRESS"}
            confirmLabel={"Confirm"}
            confirmClassName={
              "gradient-button transition-all duration-200 ease-in-out "
            }
            onClose={() => {
              setIsOpen(false);
              // the weight input is emptied when the modal closes, so the
              // saved value has to be cleared too
              setActualValue(null);
              setActualUnit(material?.defaultUnit ?? "");
              setItems([
                {
                  categoryId: "",
                  materialId: "",
                  actualValue: "",
                  actualUnit: "",
                },
                {
                  categoryId: "",
                  materialId: "",
                  actualValue: "",
                  actualUnit: "",
                },
              ]);
            }}
            onConfirm={assorted ? handleAssortedConfirm : handleSimpleConfirm}
            isPill={true}
          >
            <div className="flex flex-col gap-2 px-6 pt-6">
              <div className="flex flex-row gap-1 items-center justify-start text-sm flex-wrap">
                <button
                  className={`py-1.5 px-3 rounded-full new-border ${!assorted ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                  type="button"
                  onClick={() => setAssorted(false)}
                >
                  Single material
                </button>
                <button
                  className={`py-1.5 px-3 rounded-full new-border ${assorted ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                  type="button"
                  onClick={() => setAssorted(true)}
                >
                  Mixed or assorted material
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                The resident&apos;s choice is only an estimate. Select what you
                actually collected.
              </p>
            </div>
            {assorted ? (
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

                    <div className="input">
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

                    <div className="input">
                      <select
                        className="w-full outline-none"
                        onChange={(e) =>
                          handleItemMaterialChange(index, e.target.value)
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

                    <div className="grid grid-cols-2 gap-2">
                      <div className="input flex-1 mb-0">
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
                      <div className="input min-w-28 mb-0">
                        <select
                          className="w-full outline-none"
                          onChange={(e) =>
                            updateItem(index, "actualUnit", e.target.value)
                          }
                          value={item.actualUnit}
                        >
                          <option value="" hidden disabled>
                            e.g. kg
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
                {!material && (
                  <>
                    <label className="font-medium text-base text-text-primary px-2">
                      Material
                    </label>
                    <div className="input">
                      <select
                        className="w-full outline-none"
                        onChange={(e) =>
                          handleCategoryChange(0, e.target.value)
                        }
                        value={items[0].categoryId}
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
                    <div className="input">
                      <select
                        className="w-full outline-none"
                        onChange={(e) =>
                          handleItemMaterialChange(0, e.target.value)
                        }
                        disabled={!items[0].categoryId}
                        value={items[0].materialId}
                      >
                        <option value="" disabled hidden>
                          Material
                        </option>
                        {materialOptions[0]?.map((m) => (
                          <option value={m.id} key={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <label className="font-medium text-base text-text-primary px-2">
                  Actual Value
                </label>
                <div className="outline-1 py-2.5 pl-3.5 text-text-secondary outline-border rounded-lg focus-within:outline-accent transition-colors flex items-center justify-between">
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
                      value={actualUnit ?? ""}
                      
                    >
                      <option value="" hidden disabled>
                        e.g. kg
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
        onClick={() => {
          setAssorted(isAssorted === true);
          setIsOpen((prev) => !prev);
        }}
      >
        Complete
      </button>
    </div>
  );
};
