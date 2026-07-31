"use client";

import { createPortal } from "react-dom";
import { MegaphoneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatDate";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

const CATEGORY_COLORS = {
  EVENT: "bg-blue-50 text-blue-700",
  REMINDER: "bg-yellow-50 text-yellow-700",
  GENERAL: "bg-gray-100 text-gray-600",
  NOTICE: "bg-purple-50 text-purple-700",
  ALERT: "bg-red-50 text-red-700",
};

const CATEGORY_LABELS = {
  EVENT: "Event",
  REMINDER: "Reminder",
  GENERAL: "General",
  NOTICE: "Notice",
  ALERT: "Alert",
};

export function AnnouncementDetailModal({
  isOpen,
  onClose,
  announcement,
  handleRefetchCount,
  setIsDetailModalOpen,
}) {
  if (!isOpen) return null;

  const { makeRequest } = useMutation();

  const handleDelete = async () => {
    toast.loading("Deleting announcement");
    const success = await makeRequest({
      url: `/api/announcements/${announcement.id}`,
      method: "DELETE",
    });

    if (success) {
      toast.dismiss();
      toast.success("Announcement deleted");
      handleRefetchCount();
      setIsDetailModalOpen(false);
    } else {
      toast.dismiss();
      toast.error("Announcement deletion failed");
    }
  };

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<MegaphoneIcon className="w-6 stroke-accent" />}
      title="Announcement Details"
      subtitle="View announcement information"
      cancelLabel="Close"
      confirmLabel="Delete"
      confirmClassName="gradient-button-red"
      onConfirm={() => handleDelete()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="label">Title</label>
          <div className="outline-1 py-2.5 px-3.5 outline-gray-300 rounded-lg transition-colors min-h-11 bg-gray-50 cursor-default flex flex-row items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">
              {announcement?.title}
            </p>
            <Badge
              label={CATEGORY_LABELS[announcement?.category]}
              color={CATEGORY_COLORS[announcement?.category]}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <label className="label">Content</label>
          <textarea
            className="input mb-0 max-h-none bg-gray-50 cursor-default resize-none"
            rows={5}
            readOnly
            value={announcement?.content || ""}
          ></textarea>
        </div>

        {/* Posted By + Role + Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Posted By</label>
            <input
              type="text"
              className="input mb-0 bg-gray-50 cursor-default"
              readOnly
              value={announcement?.performedBy || ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Role</label>
            <input
              type="text"
              className="input mb-0 bg-gray-50 cursor-default"
              readOnly
              value={announcement?.performedByRole.toLowerCase() || ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Date Created</label>
            <input
              type="text"
              className="input mb-0 bg-gray-50 cursor-default"
              readOnly
              value={formatDate(announcement?.createdAt)}
            />
          </div>
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
