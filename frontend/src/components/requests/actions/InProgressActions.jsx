import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ScaleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useUpdate } from "@/hooks/useUpdate";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { formatFullName } from "@/lib/formatFullName";
import { handleUnauthorized } from "@/lib/handleUnauthorized";

const emptyRow = () => ({
  categoryId: "",
  materialId: "",
  actualValue: "",
  actualUnit: "",
});

// the keys match the row fields, so a field name can also be its error key
const emptyRowErrors = () => ({
  materialId: null,
  actualValue: null,
  actualUnit: null,
});

// "Photo does not match" switch, shared by Complete and Reject: the collector
// only sees the mismatch in person, so both outcomes can report it
const PhotoMismatchSwitch = ({ checked, onChange }) => (
  <div className="mx-6 mb-6 border-t border-gray-200 pt-4 flex flex-row items-center justify-between gap-4">
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-700">Photo does not match</p>
      <p className="text-xs text-text-secondary">
        Turn on if what you found is different from the resident&apos;s photo.
        Repeated mismatches can lead to the account being banned.
      </p>
    </div>
    <button
      className={`flex items-start shrink-0 ${
        checked ? "justify-end bg-red-500/70" : "justify-start bg-[#EFEFEF]"
      } min-w-12 p-1 rounded-full shadow-inner duration-200 transition-all ease-out`}
      role="switch"
      type="button"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="h-5 w-5 shadow rounded-full bg-white"></span>
    </button>
  </div>
);

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
  const [actualValue, setActualValue] = useState("");
  // starts from the unit the barangay set for the requested material
  const [actualUnit, setActualUnit] = useState(material?.defaultUnit ?? "");
  const { updateStatus, errorMessageRef, resultRef } = useUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // the collector's call: the photo did not match what was really collected
  const [photoMismatch, setPhotoMismatch] = useState(false);

  // Ban prompt: shown after a reported mismatch brings the resident to the
  // limit. onSuccess is held back until it closes, because it usually moves
  // the page away and would unmount the prompt.
  const [banPrompt, setBanPrompt] = useState(null);
  const {
    makeRequest: banRequest,
    isLoading: isBanning,
    errorMessageRef: banErrorRef,
  } = useMutation();

  const finishAfterAction = () => {
    const mismatch = resultRef.current?.mismatch;
    if (mismatch?.isFlagged) {
      setBanPrompt(mismatch);
      return;
    }
    onSuccess();
  };

  const closeBanPrompt = () => {
    setBanPrompt(null);
    onSuccess();
  };

  const handleBan = async () => {
    if (isBanning) return;

    const success = await banRequest({
      method: "PATCH",
      url: `/api/resident/deactivate/${banPrompt.resident.id}`,
    });

    if (success) {
      toast.success("Resident account deactivated");
      closeBanPrompt();
    } else {
      toast.error(banErrorRef.current ?? "Could not deactivate the account");
    }
  };

  // Reject: the collector found nothing to collect. Its own modal, its own
  // state, so it never mixes with the weight form
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(null);
  const [rejectMismatch, setRejectMismatch] = useState(false);

  const resetRejectForm = () => {
    setRejectionReason("");
    setRejectionReasonError(null);
    setRejectMismatch(false);
  };

  // one request saves the reason and the mismatch flag together
  const handleReject = async () => {
    if (isSubmitting) return;

    if (!rejectionReason.trim()) {
      setRejectionReasonError("Rejection reason is required");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Rejecting request...");
    const success = await updateStatus({
      id,
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      photoMismatch: rejectMismatch,
    });
    setIsSubmitting(false);
    toast.dismiss();

    if (success) {
      toast.success("Request rejected");
      setIsRejectOpen(false);
      resetRejectForm();
      finishAfterAction();
    } else {
      toast.error(errorMessageRef.current ?? "Something went wrong");
    }
  };
  const [materialOptions, setMaterialOptions] = useState([[], []]);

  const [items, setItems] = useState([emptyRow(), emptyRow()]);

  // itemErrors runs parallel to items (mixed mode), singleErrors is for the
  // single form
  const [itemErrors, setItemErrors] = useState([
    emptyRowErrors(),
    emptyRowErrors(),
  ]);
  const [singleErrors, setSingleErrors] = useState(emptyRowErrors());

  const clearItemError = (index, field) => {
    setItemErrors((prev) =>
      prev.map((errors, i) =>
        i === index ? { ...errors, [field]: null } : errors,
      ),
    );
  };

  const clearSingleError = (field) => {
    setSingleErrors((prev) => ({ ...prev, [field]: null }));
  };

  // the two modes show different fields, so leaving one drops its messages
  const switchMode = (toAssorted) => {
    setAssorted(toAssorted);
    setItemErrors(items.map(() => emptyRowErrors()));
    setSingleErrors(emptyRowErrors());
  };

  const updateItem = (index, field, value) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
    clearItemError(index, field);
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

    clearItemError(index, "materialId");
    if (defaultUnit) clearItemError(index, "actualUnit");

    // index 0 is also the single form, which reads its unit from its own state
    if (index === 0) {
      clearSingleError("materialId");
      if (defaultUnit) {
        setActualUnit(defaultUnit);
        clearSingleError("actualUnit");
      }
    }
  };

  const addRow = () => {
    setItems([...items, emptyRow()]);
    setMaterialOptions([...materialOptions, []]);
    setItemErrors([...itemErrors, emptyRowErrors()]);
  };

  // items, materialOptions and itemErrors are parallel lists, so a row leaves
  // all three
  const removeRow = (index) => {
    setItems(items.filter((item, i) => i !== index));
    setMaterialOptions(materialOptions.filter((options, i) => i !== index));
    setItemErrors(itemErrors.filter((errors, i) => i !== index));
  };

  const resetForm = () => {
    setActualValue("");
    setActualUnit(material?.defaultUnit ?? "");
    setItems([emptyRow(), emptyRow()]);
    setMaterialOptions([[], []]);
    setItemErrors([emptyRowErrors(), emptyRowErrors()]);
    setSingleErrors(emptyRowErrors());
    setPhotoMismatch(false);
  };

  // starts the form from the material the resident requested (still editable).
  // The request only carries the category name, and names are unique, so the
  // id comes from the categories list. Done on open, not on mount, because
  // categories may still be loading when the component first renders.
  const prefillRequestedMaterial = () => {
    if (!material) return;

    const categoryId =
      categories?.find((c) => c.name === material.category?.name)?.id ?? "";

    setItems((prev) =>
      prev.map((item, i) =>
        i === 0
          ? {
              ...item,
              categoryId,
              materialId: material.id,
              actualUnit: material.defaultUnit ?? item.actualUnit,
            }
          : item,
      ),
    );

    // the material select needs its options to show the chosen material
    if (categoryId) loadMaterials(0, categoryId);
  };

  const handleAssortedConfirm = async () => {
    if (isSubmitting) return;

    // check every row at once so the user sees all the problems in one go
    const nextErrors = items.map((item) => ({
      materialId: item.materialId ? null : "Select a material",
      actualValue:
        Number(item.actualValue) > 0 ? null : "Enter a weight greater than 0",
      actualUnit: item.actualUnit ? null : "Select a unit",
    }));
    setItemErrors(nextErrors);

    if (nextErrors.some((errors) => Object.values(errors).some(Boolean))) {
      return;
    }

    setIsSubmitting(true);
    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      // the inputs hold strings, the request gets real numbers
      items: items.map((item) => ({
        ...item,
        actualValue: Number(item.actualValue),
      })),
      isAssorted: true,
      photoMismatch,
    });
    setIsSubmitting(false);
    toast.dismiss();

    if (success) {
      toast.success("Record finalized! Request collected!");
      setIsOpen(false);
      resetForm();
      finishAfterAction();
    } else {
      toast.error("Something went wrong");
    }
  };

  const handleSimpleConfirm = async () => {
    if (isSubmitting) return;

    // the collector can change the requested material, so the first row is the
    // source of truth
    const materialId = items[0].materialId;

    const nextErrors = {
      materialId: materialId ? null : "Select a material",
      actualValue:
        Number(actualValue) > 0 ? null : "Enter a weight greater than 0",
      actualUnit: actualUnit ? null : "Select a unit",
    };
    setSingleErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    toast.loading("Finalizing Record ");
    const success = await updateStatus({
      id,
      status: "COLLECTED",
      items: [{ materialId, actualValue: Number(actualValue), actualUnit }],
      isAssorted: false,
      photoMismatch,
    });
    setIsSubmitting(false);
    toast.dismiss();

    if (success) {
      toast.success("Record finalized! Request collected!");
      setIsOpen(false);
      resetForm();
      finishAfterAction();
    } else {
      toast.error("Something went wrong");
    }
  };

  const loadMaterials = async (index, categoryId) => {
    const response = await fetch(`/api/material/barangay?categoryId=${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.status === 401) return handleUnauthorized();

    if (!response.ok) {
      toast.error("Could not load the materials");
      return;
    }

    const result = await response.json();

    // functional update, because the fetch above makes this async
    setMaterialOptions((prev) =>
      prev.map((options, i) => (i === index ? (result.materials ?? []) : options)),
    );
  };

  const handleCategoryChange = (index, categoryId) => {
    // the old material belongs to the old category, so drop it and its options
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, categoryId, materialId: "" } : item,
      ),
    );
    setMaterialOptions((prev) =>
      prev.map((options, i) => (i === index ? [] : options)),
    );
    clearItemError(index, "materialId");
    if (index === 0) clearSingleError("materialId");

    loadMaterials(index, categoryId);
  };

  return (
    <div
      className={` ${variant === "detail" ? "grid grid-cols-2 gap-3 w-full" : "flex items-center gap-3 text-sm"}`}
    >
      {banPrompt &&
        createPortal(
          <Modal
            isOpen={true}
            title={"Mismatch limit reached"}
            subtitle={formatFullName(banPrompt.resident)}
            icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
            cancelLabel={"Not now"}
            confirmLabel={isBanning ? "Please wait..." : "Deactivate account"}
            confirmClassName={"gradient-button-red duration-300 ease-in-out transition-all"}
            onClose={() => !isBanning && closeBanPrompt()}
            onConfirm={handleBan}
          >
            <div className="p-6 text-sm text-gray-600 flex flex-col gap-2">
              <p>
                This resident now has {banPrompt.mismatchCount} photo{" "}
                {banPrompt.mismatchCount === 1 ? "mismatch" : "mismatches"}{" "}
                (limit {banPrompt.mismatchLimit}).
              </p>
              <p>
                Do you want to deactivate their account now? If you choose Not
                now, they stay on the Residents page under Needs review, where
                the Captain or Secretary can decide.
              </p>
            </div>
          </Modal>,
          document.body,
        )}

      {isRejectOpen &&
        createPortal(
          <Modal
            isOpen={isRejectOpen}
            title={"Reject Request"}
            subtitle={"Nothing to collect? State the reason"}
            status={"IN_PROGRESS"}
            icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
            confirmLabel={"Reject"}
            confirmClassName={"gradient-button-red duration-300 ease-in-out transition-all"}
            onClose={() => {
              setIsRejectOpen(false);
              resetRejectForm();
            }}
            onConfirm={handleReject}
            isPill={true}
          >
            <div className="flex flex-col gap-1 p-6">
              <label className="label">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input mb-0 max-h-none"
                rows={4}
                placeholder="Input the reason here"
                value={rejectionReason}
                onChange={(event) => {
                  setRejectionReason(event.target.value);
                  setRejectionReasonError(null);
                }}
              />
              {rejectionReasonError && (
                <p className="text-xs text-red-400">{rejectionReasonError}</p>
              )}
            </div>
            <PhotoMismatchSwitch
              checked={rejectMismatch}
              onChange={setRejectMismatch}
            />
          </Modal>,
          document.body,
        )}

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
              resetForm();
            }}
            onConfirm={assorted ? handleAssortedConfirm : handleSimpleConfirm}
            isPill={true}
          >
            <div className="flex flex-col gap-2 px-6 pt-6">
              <div className="flex flex-row gap-1 items-center justify-start text-sm flex-wrap">
                <button
                  className={`py-1.5 px-3 rounded-full new-border ${!assorted ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                  type="button"
                  onClick={() => switchMode(false)}
                >
                  Single material
                </button>
                <button
                  className={`py-1.5 px-3 rounded-full new-border ${assorted ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                  type="button"
                  onClick={() => switchMode(true)}
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
                    {itemErrors[index]?.materialId && (
                      <p className="text-xs text-red-400 px-2 mb-2">
                        {itemErrors[index].materialId}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="input flex-1 mb-0">
                          <input
                            type="number"
                            className="outline-none w-full"
                            placeholder="e.g. 1"
                            min={0}
                            value={item.actualValue}
                            onChange={(e) =>
                              updateItem(index, "actualValue", e.target.value)
                            }
                          />
                        </div>
                        {itemErrors[index]?.actualValue && (
                          <p className="text-xs text-red-400 px-2 mt-1">
                            {itemErrors[index].actualValue}
                          </p>
                        )}
                      </div>
                      <div>
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
                        {itemErrors[index]?.actualUnit && (
                          <p className="text-xs text-red-400 px-2 mt-1">
                            {itemErrors[index].actualUnit}
                          </p>
                        )}
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
                  Material <span className="text-red-500">*</span>
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
                {singleErrors.materialId && (
                  <p className="text-xs text-red-400 px-2 mb-2">
                    {singleErrors.materialId}
                  </p>
                )}
                <label className="font-medium text-base text-text-primary px-2">
                  Actual Value <span className="text-red-500">*</span>
                </label>
                <div className="outline-1 py-2.5 pl-3.5 text-text-secondary outline-border rounded-lg focus-within:outline-accent transition-colors flex items-center justify-between">
                  <div className="flex flex-row justify-center items-center w-full pr-4">
                    <input
                      type="number"
                      className="outline-none w-full"
                      placeholder="e.g. 1"
                      min={0}
                      value={actualValue}
                      onChange={(event) => {
                        setActualValue(event.target.value);
                        clearSingleError("actualValue");
                      }}
                    />
                    <select
                      className="outline-none"
                      onChange={(event) => {
                        setActualUnit(event.target.value);
                        clearSingleError("actualUnit");
                      }}
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
                {singleErrors.actualValue && (
                  <p className="text-xs text-red-400 px-2">
                    {singleErrors.actualValue}
                  </p>
                )}
                {singleErrors.actualUnit && (
                  <p className="text-xs text-red-400 px-2">
                    {singleErrors.actualUnit}
                  </p>
                )}
              </div>
            )}

            <PhotoMismatchSwitch
              checked={photoMismatch}
              onChange={setPhotoMismatch}
            />
          </Modal>,
          document.body,
        )}

      <button
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button-red transition-all duration-200 ease-in-out" : "text-red-500 hover:underline"}`}
        onClick={() => setIsRejectOpen((prev) => !prev)}
      >
        Reject
      </button>
      <button
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button transition-all duration-200 ease-in-out" : "text-green-600 hover:underline"}`}
        onClick={() => {
          setAssorted(isAssorted === true);
          if (!isOpen) prefillRequestedMaterial();
          setIsOpen((prev) => !prev);
        }}
      >
        Complete
      </button>
    </div>
  );
};
