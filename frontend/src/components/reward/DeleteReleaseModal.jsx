"use client";

import { Modal } from "@/components/ui/Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export const DeleteReleaseModal = ({
  isOpen,
  setIsOpen,
  release,
  beneficiaryName,
  handleReleasesRefetchCount,
  handleSummaryRefetchCount,
  handleItemsRefetchCount,
}) => {
  const { makeRequest, errorMessageRef } = useMutation();

  const handleDelete = async () => {
    toast.loading("Deleting release");

    const success = await makeRequest({
      url: `/api/rewards/release/${release.id}`,
      method: "DELETE",
    });

    toast.dismiss();

    if (success) {
      toast.success("Release deleted");
      setIsOpen(false);
      handleReleasesRefetchCount();
      handleSummaryRefetchCount();
      handleItemsRefetchCount();
    } else {
      toast.error(errorMessageRef.current ?? "Deleting release failed");
    }
  };

  return (
    <Modal
      title={"Delete Release"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<ExclamationTriangleIcon className="w-6 stroke-accent" />}
      subtitle={"This action cannot be undone"}
      confirmLabel={"Delete"}
      cancelLabel={"Go Back"}
      confirmClassName={"gradient-button-red"}
      onConfirm={() => handleDelete()}
    >
      <div className="p-6 flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Delete this release to {release?.residentName}? Use this when it was
          recorded by mistake.
        </p>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase text-green-700">
            What comes back
          </p>
          <div className="flex flex-row justify-between gap-4 text-sm">
            <span className="text-gray-600">Reward item</span>
            <span className="font-semibold text-text-primary text-right">
              {release?.rewardItem?.name}
            </span>
          </div>
          <div className="flex flex-row justify-between gap-4 text-sm">
            <span className="text-gray-600">Quantity back to stock</span>
            <span className="font-semibold text-text-primary text-nowrap">
              +{release?.quantity}
            </span>
          </div>
          <div className="flex flex-row justify-between gap-4 text-sm">
            <span className="text-gray-600">
              Points back to {release?.residentName}
            </span>
            <span className="font-semibold text-text-primary text-nowrap">
              +{release?.quantity * release?.rewardItem?.pointCost} pts
            </span>
          </div>
        </div>

        {beneficiaryName && (
          <p className="text-gray-600 text-sm">
            This release was for {beneficiaryName}. They can receive a reward
            from this program again only after all of their releases in it are
            deleted.
          </p>
        )}
      </div>
    </Modal>
  );
};
