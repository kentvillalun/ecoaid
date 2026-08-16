"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export function EditResidentModal({
  isOpen,
  onClose,
  currentResidentData,
  handleRefetchCount,
}) {
  const [firstName, setFirstName] = useState(currentResidentData.firstName);
  const [lastName, setLastName] = useState(currentResidentData.lastName);
  const [phoneNumber, setPhoneNumber] = useState(
    currentResidentData.phoneNumber,
  );
  const [sitio, setSitio] = useState(currentResidentData.purok);
  const [isVerified, setIsVerified] = useState(currentResidentData.isVerified);
  const { data } = useFetch({ url: "/api/barangay/sitio" });
  const { makeRequest } = useMutation();

  if (!isOpen) return null;

  const resetModal = () => {
    setFirstName(currentResidentData.firstName);
    setLastName(currentResidentData.lastName);
    setPhoneNumber(currentResidentData.phoneNumber);
    setSitio(currentResidentData.purok);
    setIsVerified(currentResidentData.isVerified);
  };

  const hasChanges =
    firstName !== currentResidentData.firstName ||
    lastName !== currentResidentData.lastName ||
    phoneNumber !== currentResidentData.phoneNumber ||
    sitio !== currentResidentData.sitioId ||
    isVerified !== currentResidentData.isVerified;

  const handleSubmit = async () => {
    if (!hasChanges) return;
    toast.loading();
    const success = await makeRequest({
      method: "PATCH",
      url: `/api/resident/${currentResidentData.id}`,
      body: {
        firstName:
          firstName !== currentResidentData.firstName ? firstName : undefined,
        lastName:
          lastName !== currentResidentData.lastName ? lastName : undefined,
        phoneNumber:
          phoneNumber !== currentResidentData.phoneNumber
            ? phoneNumber
            : undefined,
        sitioId: sitio !== currentResidentData.purok ? sitio : undefined,
        isVerified:
          isVerified !== currentResidentData.isVerified
            ? isVerified
            : undefined,
      },
    });

    if (success) {
      toast.dismiss();
      toast.success("Resident record edited successfully");
      onClose();
      handleRefetchCount();
    } else {
      toast.dismiss();
      toast.error("Edit failed. Plaese try again");
    }
  };

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetModal();
      }}
      icon={<UserCircleIcon className="w-6 stroke-accent" />}
      title="Edit Resident"
      subtitle="Update household details and verification status"
      confirmLabel="Save Changes"
      confirmClassName="gradient-button"
      onConfirm={() => handleSubmit()}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* First name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="label">
            First name
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="firstName"
              className="w-full outline-none"
              placeholder="e.g. Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        </div>

        {/* Last name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="label">
            Last name
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="lastName"
              className="w-full outline-none"
              placeholder="e.g. Dela Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Phone number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="phoneNumber" className="label">
            Phone number
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="phoneNumber"
              className="w-full outline-none"
              placeholder="e.g. 09171234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Sitio */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sitio" className="label">
            Sitio
          </label>
          <div className="input flex items-center mb-0">
            <select
              id="sitio"
              className="w-full outline-none"
              value={sitio}
              onChange={(e) => setSitio(e.target.value)}
            >
              <option defaultValue={""} disabled hidden>
                {currentResidentData.purok}
              </option>
              {data?.sitios?.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verified status — visually separated, distinct from field edits */}
        <div className="min-w-full border-t border-gray-200 mt-1 pt-4 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="label text-sm">Verified</p>
            <p className="text-gray-500 text-xs">
              Mark this resident as verified for your barangay
            </p>
          </div>
          <button
            className={`flex items-start ${
              isVerified
                ? "justify-end bg-green-500/70"
                : "justify-start bg-[#EFEFEF]"
            } min-w-12 p-1 rounded-full shadow-inner duration-200 transition-all ease-out`}
            role="switch"
            type="button"
            aria-checked={isVerified}
            onClick={() => setIsVerified(!isVerified)}
          >
            <span className="h-5 w-5 shadow rounded-full bg-white"></span>
          </button>
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
