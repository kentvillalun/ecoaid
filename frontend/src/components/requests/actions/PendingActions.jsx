"use client";

import { useUpdate } from "@/hooks/useUpdate.js";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const PendingActions = ({ id, onSuccess, variant }) => {
  const { data, isLoading, error, isError, updateStatus, errorMessageRef } = useUpdate();
  const [isOpen, setIsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(null)
  const router = useRouter()

  return (
    <div className={` ${variant === "detail" ? "grid grid-cols-2 text-md font-semibold gap-3 w-full" : "flex items-center gap-3 text-sm"}`}>
      {isOpen &&
        createPortal(
          <Modal
            title={"Decline Request"}
            isOpen={isOpen}
            subtitle={"Please state the rejection reason"}
            status={"REQUESTED"}
            icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
            confirmLabel={"Decline"}
            confirmClassName={"gradient-button-red duration-300 ease-in-out transition-all"}
            onClose={() => {
              setIsOpen(false)
              setRejectionReason("")
              setRejectionReasonError(null)
            }}
            onConfirm={async () => {
              if (!rejectionReason.trim()) {
                setRejectionReasonError("Rejection reason is required")
                return
              }
              toast.loading("Declining request...")
              const success = await updateStatus({ id, status: "REJECTED", rejectionReason: rejectionReason.trim() });
              if (success) {
                toast.dismiss()
                toast.success("Request declined")
                setIsOpen(false)
                setRejectionReason("")
                setRejectionReasonError(null)
                onSuccess();
              } else {
                toast.dismiss()
                toast.error(errorMessageRef.current ?? "Something went wrong")
              }
            }}
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
                  setRejectionReason(event.target.value)
                  setRejectionReasonError(null)
                }}
              />
              {rejectionReasonError && (
                <p className="text-xs text-red-400">{rejectionReasonError}</p>
              )}
            </div>
          </Modal>,
          document.body,
        )}
      <button
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button-red  transition-all duration-200 ease-in-out " : "text-red-500 hover:underline"}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Decline
      </button>
      <button
        className={` ${variant === "detail" ? "py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button transition-all duration-200 ease-in-out" : "text-green-600 hover:underline"}` }
        onClick={async () => {
          toast.loading("Approving request...")
          const success = await updateStatus({ id, status: "APPROVED" });
          if (success) {
            setIsOpen(false);
            toast.dismiss()
            toast.success("Request approved");
            onSuccess()
          } else {
            toast.dismiss()
            toast.error(errorMessageRef.current ?? "Something went wrong")
          }
        }}
        
      >
        Approve
      </button>
    </div>
  );
};
