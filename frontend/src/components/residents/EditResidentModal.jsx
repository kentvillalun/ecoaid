"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { UserCircleIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { PHONE_REGEX } from "@/lib/validators";
import { formatDate } from "@/lib/formatDate";

export function EditResidentModal({
  isOpen,
  onClose,
  currentResidentData,
  handleRefetchCount,
}) {
  const [firstName, setFirstName] = useState(currentResidentData.firstName);
  const [middleName, setMiddleName] = useState(
    currentResidentData.middleName ?? "",
  );
  const [lastName, setLastName] = useState(currentResidentData.lastName);
  const [phoneNumber, setPhoneNumber] = useState(
    currentResidentData.phoneNumber,
  );
  const [sitio, setSitio] = useState(currentResidentData.sitioId ?? "");
  const [isVerified, setIsVerified] = useState(currentResidentData.isVerified);
  const { data } = useFetch({ url: "/api/barangay/sitio" });
  const { makeRequest, isLoading: isBanActionLoading, errorMessageRef } = useMutation();
  // which ban action is awaiting confirmation: "deactivate" | "reactivate" | null
  const [pendingBanAction, setPendingBanAction] = useState(null);

  // error messages
  const [firstNameError, setFirstNameError] = useState(null);
  const [middleNameError, setMiddleNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setFirstName(currentResidentData.firstName);
    setMiddleName(currentResidentData.middleName ?? "");
    setLastName(currentResidentData.lastName);
    setPhoneNumber(currentResidentData.phoneNumber);
    setSitio(currentResidentData.sitioId ?? "");
    setIsVerified(currentResidentData.isVerified);
    setFirstNameError(null);
    setMiddleNameError(null);
    setLastNameError(null);
    setPhoneNumberError(null);
  };

  const first = (firstName ?? "").trim();
  const middle = middleName.trim();
  const last = (lastName ?? "").trim();
  const phone = (phoneNumber ?? "").trim();
  const originalSitio = currentResidentData.sitioId ?? "";

  const hasChanges =
    first !== currentResidentData.firstName ||
    middle !== (currentResidentData.middleName ?? "") ||
    last !== currentResidentData.lastName ||
    phone !== currentResidentData.phoneNumber ||
    sitio !== originalSitio ||
    isVerified !== currentResidentData.isVerified;

  const isBanned = !currentResidentData.isActive;
  const capitalize = (text) =>
    text ? text.charAt(0) + text.slice(1).toLowerCase() : "";

  // ban and lift are their own endpoints, so they never go through Save Changes
  const handleBanAction = async () => {
    const action = pendingBanAction;
    const success = await makeRequest({
      method: "PATCH",
      url: `/api/resident/${action}/${currentResidentData.id}`,
    });

    setPendingBanAction(null);
    if (success) {
      toast.success(
        action === "deactivate"
          ? "Resident account deactivated"
          : "Resident account reactivated",
      );
      onClose();
      handleRefetchCount();
    } else {
      toast.error(errorMessageRef.current ?? "Action failed. Please try again");
    }
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!first) {
      setFirstNameError("First name is required");
      hasError = true;
    } else {
      setFirstNameError(null);
    }

    if (!middle) {
      setMiddleNameError("Middle name is required");
      hasError = true;
    } else {
      setMiddleNameError(null);
    }

    if (!last) {
      setLastNameError("Last name is required");
      hasError = true;
    } else {
      setLastNameError(null);
    }

    if (!phone) {
      setPhoneNumberError("Phone number is required");
      hasError = true;
    } else if (!PHONE_REGEX.test(phone)){
      setPhoneNumberError("Enter a valid 11-digit phone number");
      hasError = true
    } else {
      setPhoneNumberError(null)
    }

    if (hasError) return;

    if (!hasChanges) return toast.error("There are no changes");
    toast.loading("Saving changes...");
    const success = await makeRequest({
      method: "PATCH",
      url: `/api/resident/${currentResidentData.id}`,
      body: {
        firstName: first !== currentResidentData.firstName ? first : undefined,
        middleName:
          middle !== (currentResidentData.middleName ?? "")
            ? middle
            : undefined,
        lastName: last !== currentResidentData.lastName ? last : undefined,
        phoneNumber:
          phone !== currentResidentData.phoneNumber ? phone : undefined,
        sitioId: sitio !== originalSitio ? sitio : undefined,
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
      toast.error("Edit failed. Please try again");
    }
  };

  return createPortal(
    <>
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
            First name <span className="text-red-500">*</span>
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="firstName"
              className="w-full outline-none"
              placeholder="e.g. Juan"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFirstNameError(null);
              }}
            />
          </div>
          {firstNameError && (
            <p className="text-xs text-red-400">{firstNameError}</p>
          )}
        </div>

        {/* Middle name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="middleName" className="label">
            Middle name <span className="text-red-500">*</span>
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="middleName"
              className="w-full outline-none"
              placeholder="e.g. Reyes"
              value={middleName}
              onChange={(e) => {
                setMiddleName(e.target.value);
                setMiddleNameError(null);
              }}
            />
          </div>
          {middleNameError && (
            <p className="text-xs text-red-400">{middleNameError}</p>
          )}
        </div>

        {/* Last name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="label">
            Last name <span className="text-red-500">*</span>
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="lastName"
              className="w-full outline-none"
              placeholder="e.g. Dela Cruz"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                setLastNameError(null)
              }}
            />
          </div>
          {lastNameError && (
            <p className="text-xs text-red-400">{lastNameError}</p>
          )}
        </div>

        {/* Phone number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="phoneNumber" className="label">
            Phone number <span className="text-red-500">*</span>
          </label>
          <div className="input flex items-center mb-0">
            <input
              type="text"
              id="phoneNumber"
              className="w-full outline-none"
              placeholder="e.g. 09171234567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setPhoneNumberError(null)
              }}
            />
          </div>
          {phoneNumberError && (
            <p className="text-xs text-red-400">{phoneNumberError}</p>
          )}
        </div>

        {/* Sitio: hidden when the barangay has no sitios */}
        {data?.sitios?.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="sitio" className="label">
              Sitio
            </label>
            <div className="input flex items-center mb-0">
              <select
                id="sitio"
                className="w-full outline-none"
                value={sitio ?? ""}
                onChange={(e) => setSitio(e.target.value)}
              >
                <option value="" disabled hidden>
                  {currentResidentData.purok ?? "Not assigned"}
                </option>
                {data?.sitios?.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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

        {/* Account ban — separate from Save Changes, has its own request */}
        <div className="min-w-full border-t border-gray-200 mt-1 pt-4 flex flex-col gap-3">
          {isBanned ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="label text-sm">
                  {currentResidentData.isVerified
                    ? "Account banned"
                    : "Account blocked"}
                </p>
                <p className="text-gray-500 text-xs">
                  {currentResidentData.isVerified
                    ? "This verified resident was deactivated by barangay staff and is signed out of the app."
                    : "This resident was deactivated before ever being verified, usually because they do not belong to this barangay."}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700 flex flex-col gap-1">
                <p>
                  Deactivated by{" "}
                  <span className="font-medium">
                    {currentResidentData.deactivatedByName ?? "Unknown staff"}
                  </span>
                  {currentResidentData.deactivatedByRole &&
                    ` (${capitalize(currentResidentData.deactivatedByRole)})`}
                </p>
                {currentResidentData.deactivatedAt && (
                  <p>On {formatDate(currentResidentData.deactivatedAt)}</p>
                )}
              </div>
              {currentResidentData.reactivatedAt && (
                <p className="text-gray-500 text-xs">
                  Previously reactivated on{" "}
                  {formatDate(currentResidentData.reactivatedAt)}
                </p>
              )}
              <button
                type="button"
                disabled={hasChanges}
                onClick={() => setPendingBanAction("reactivate")}
                className="py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:cursor-pointer hover:opacity-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lift ban
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <p className="label text-sm">Deactivate account</p>
                <p className="text-gray-500 text-xs">
                  The resident is signed out and cannot log in until you lift
                  the ban. Their past contributions stay on record.
                </p>
              </div>
              {currentResidentData.reactivatedAt && (
                <p className="text-gray-500 text-xs">
                  Previously reactivated on{" "}
                  {formatDate(currentResidentData.reactivatedAt)}
                </p>
              )}
              <button
                type="button"
                disabled={hasChanges}
                onClick={() => setPendingBanAction("deactivate")}
                className="py-2.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:cursor-pointer hover:opacity-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deactivate account
              </button>
            </>
          )}
          {hasChanges && (
            <p className="text-gray-500 text-xs">
              Save or discard your changes before changing the account status.
            </p>
          )}
        </div>
      </div>
    </Modal>

    {/* Confirmation layered over the edit modal */}
    <Modal
      isOpen={pendingBanAction !== null}
      onClose={() => setPendingBanAction(null)}
      icon={<NoSymbolIcon className="w-6 stroke-accent" />}
      title={
        pendingBanAction === "deactivate"
          ? "Deactivate this account?"
          : "Lift this ban?"
      }
      subtitle={`${currentResidentData.firstName} ${currentResidentData.lastName}`}
      confirmLabel={
        isBanActionLoading
          ? "Please wait..."
          : pendingBanAction === "deactivate"
            ? "Deactivate"
            : "Lift ban"
      }
      confirmClassName={
        pendingBanAction === "deactivate" ? "bg-red-600" : "gradient-button"
      }
      onConfirm={handleBanAction}
    >
      <div className="p-6 text-sm text-gray-600">
        {pendingBanAction === "deactivate"
          ? "They will be signed out on their next request and shown a message that the account was deactivated. You can lift the ban at any time."
          : "They will be able to log in again. If they get photo mismatches after this, the count starts from zero."}
      </div>
    </Modal>
    </>,
    document.body,
  );
}
