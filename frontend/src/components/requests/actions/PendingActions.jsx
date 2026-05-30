"use client";

import { useUpdate } from "@/hooks/useUpdate.js";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const PendingActions = ({ id, onSuccess, variant }) => {
  const { data, isLoading, error, isError, updateStatus } = useUpdate();
  const [isOpen, setIsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
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
            icon={<ExclamationTriangleIcon className="w-6 stroke-black" />}
            confirmLabel={"Decline"}
            confirmClassName={"bg-red-500 hover:bg-red-600 duration-300 ease-in-out transition-all"}
            onClose={() => setIsOpen(false)}
            onConfirm={async () => {
              toast.loading("Declining request...")
              const success = await updateStatus({ id, status: "REJECTED", rejectionReason });
              if (success) {
                toast.dismiss()
                toast.success("Request declined")
                setIsOpen(false)
                onSuccess();
              } else {
                toast.dismiss()
                toast.error("Someting went wrong")

              }
            }}
            isPill={true}
          >
            <div className="flex flex-col gap-1 p-6">
              <label className="text-gray-700 font-semibol">
                Rejection Reason
              </label>
              <textarea
                type="text"
                className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors"
                rows={4}
                placeholder="Input the reason here"
                onChange={(event) => setRejectionReason(event.target.value)}
              />
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
            toast.dismiss
            toast.error("Someting went wrong")
          }
        }}
        
      >
        Approve
      </button>
    </div>
  );
};
