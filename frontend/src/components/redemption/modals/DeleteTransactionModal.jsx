"use client";

import { Modal } from "@/components/ui/Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@/hooks/useMutation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DeleteTransactionModal = ({ isOpen, setIsOpen, transaction }) => {
  const { makeRequest, errorMessageRef } = useMutation();
  const router = useRouter();

  const handleDelete = async () => {
    toast.loading("Deleting transaction");

    const success = await makeRequest({
      url: `/api/redemption/transactions/${transaction.id}`,
      method: "DELETE",
    });

    if (success) {
      toast.dismiss();
      toast.success("Transaction deleted");
      setIsOpen(false);
      router.push("/redemption");
    } else {
      toast.dismiss();
      toast.error(errorMessageRef.current ?? "Deleting transaction failed");
    }
  };

  return (
    <Modal
      title={"Delete Transaction"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
      subtitle={"This action cannot be undone"}
      confirmLabel={"Delete"}
      cancelLabel={"Go Back"}
      confirmClassName={"gradient-button-red"}
      onConfirm={() => handleDelete()}
    >
      <div className="p-6">
        <p className="text-gray-600 text-sm">
          Delete this transaction for {transaction.residentName}? The materials
          will be removed from the MRF inventory and the resident will lose the
          points from it. Use this when the transaction was given to the wrong
          person.
        </p>
      </div>
    </Modal>
  );
};
