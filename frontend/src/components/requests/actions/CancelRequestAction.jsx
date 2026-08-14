"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { useMutation } from "@/hooks/useMutation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export const CancelRequestAction = ({ id, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { makeRequest } = useMutation();

  return (
    <>
      {isOpen &&
        createPortal(
          <Modal
            title={"Cancel Request"}
            isOpen={isOpen}
            subtitle={"This action cannot be undone"}
            icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
            confirmLabel={"Cancel Request"}
            cancelLabel={"Go Back"}
            confirmClassName={"gradient-button-red duration-300 ease-in-out transition-all"}
            onClose={() => setIsOpen(false)}
            onConfirm={async () => {
              toast.loading("Cancelling request...");
              const success = await makeRequest({
                url: `/api/pickup-requests/${id}/cancel`,
                method: "PATCH",
              });
              if (success) {
                toast.dismiss();
                toast.success("Request cancelled");
                setIsOpen(false);
                onSuccess();
              } else {
                toast.dismiss();
                toast.error("This request can no longer be cancelled");
              }
            }}
          >
            <div className="flex flex-col gap-1 p-6">
              <p className="text-gray-600 text-sm">
                Are you sure you want to cancel this request? Once cancelled,
                this cannot be undone and you will need to submit a new
                request if you change your mind.
              </p>
            </div>
          </Modal>,
          document.body,
        )}
      <button
        className="py-2.5 text-white rounded-xl hover:cursor-pointer gradient-button-red w-full transition-all duration-200 ease-in-out"
        onClick={() => setIsOpen(true)}
      >
        Cancel Request
      </button>
    </>
  );
};
