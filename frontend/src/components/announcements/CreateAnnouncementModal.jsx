"use client";

import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export function CreateAnnouncementModal({ isOpen, setIsCreateModalOpen, handleRefetchCount }) {
  if (!isOpen) return null;
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [contentError, setContentError] = useState(null);
  const { makeRequest } = useMutation();

  const handleSubmit = async () => {
    let hasError = false;

    if (!title || title === "") {
      setTitleError("Title is required");
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (!category || category === "") {
      setCategoryError("Category is required");
      hasError = true;
    } else {
      setCategoryError(null);
    }

    if (!content || content === "") {
      setContentError("Content is required");
      hasError = true;
    } else {
      setContentError(null);
    }

    if (hasError) return toast.error("Announcement creation failed");

    toast.loading("Creating announcement");

    const success = await makeRequest({
      url: "/api/announcements",
      body: {
        title,
        category,
        content,
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Announcement created");
      setIsCreateModalOpen(false);
      handleRefetchCount()
    } else {
      toast.dismiss();
      toast.error("Announcement creation failed");
    }
  };

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => setIsCreateModalOpen(false)}
      icon={<MegaphoneIcon className="w-6 stroke-new-primary" />}
      title="Create Announcement"
      subtitle="Publish a new announcement to residents"
      confirmLabel="Publish"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="label">Title</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
            <input
              type="text"
              className="w-full outline-none"
              placeholder="e.g. Community Cleanup Drive"
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {titleError && <p className="text-xs text-red-400">{titleError}</p>}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="label">Category</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors min-h-11 max-h-11 flex items-center">
            <select
              className="w-full outline-none"
              defaultValue=""
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" hidden disabled>
                Choose a category
              </option>
              <option value="GENERAL">General</option>
              <option value="EVENT">Event</option>
              <option value="REMINDER">Reminder</option>
              <option value="NOTICE">Notice</option>
              <option value="ALERT">Alert</option>
            </select>
          </div>
          {categoryError && (
            <p className="text-xs text-red-400">{titleError}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <label className="label">Content</label>
          <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors flex items-start">
            <textarea
              className="w-full outline-none"
              rows={4}
              placeholder="Write the announcement details..."
              required
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {contentError && (
            <p className="text-xs text-red-400">{contentError}</p>
          )}
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
