"use client";

import { formatFullName } from "@/lib/formatFullName";
import { Page } from "@/components/layout/Page.jsx";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Error } from "@/components/ui/Error";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { PHONE_REGEX } from "@/lib/validators";

const EMPTY_ERRORS = {
  firstName: null,
  middleName: null,
  lastName: null,
  phoneNumber: null,
};

// one mapping for the initial state, the data effect and the reset
const toFormData = (user) => ({
  firstName: user?.firstName ?? "",
  middleName: user?.middleName ?? "",
  lastName: user?.lastName ?? "",
  phoneNumber: user?.phoneNumber ?? "",
});

export default function PersonalInformationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const url = `/api/resident/me`;
  const [refetchCount, setRefetchCount] = useState(0);
  const { isLoading, isError, data } = useFetch({ url, refetchCount });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState(toFormData());
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { makeRequest, errorMessageRef } = useMutation();

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  useEffect(() => {
    if (data) {
      setFormData(toFormData(data?.user));
    }
  }, [data]);

  const validatePhone = (value) => {
    const phone = String(value ?? "").trim();

    if (!phone) return "Phone number is required";
    if (!PHONE_REGEX.test(phone))
      return "Enter an 11-digit number starting with 09";
    return null;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // leaving edit mode throws the draft away, so unsaved text and old error
  // messages don't stay on the (now disabled) fields
  const resetForm = () => {
    setFormData(toFormData(data?.user));
    setErrors(EMPTY_ERRORS);
  };

  // the header passes this straight to onClick, so it ignores the click event
  const toggleEditing = () => {
    if (isEditing) resetForm();
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // validate and send the trimmed values
    const values = {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      phoneNumber: String(formData.phoneNumber ?? "").trim(),
    };

    const nextErrors = {
      firstName: values.firstName ? null : "First name is required",
      middleName: values.middleName ? null : "Middle name is required",
      lastName: values.lastName ? null : "Last name is required",
      phoneNumber: validatePhone(values.phoneNumber),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    toast.loading("Updating personal information");
    const success = await makeRequest({
      url,
      method: "PATCH",
      body: values,
    });
    setIsSubmitting(false);
    toast.dismiss();

    if (success) {
      toast.success("Update successful");
      handleRefetchCount();
      setIsEditing(false);
    } else {
      toast.error(errorMessageRef.current ?? "Update failed");
    }
  };

  return (
    <Page className="bg-bg!">
      <ResidentHeader
        title={"Personal Information"}
        action={"edit"}
        setIsEditing={toggleEditing}
        isEditing={isEditing}
        handleClick={() => {
          if (isEditing) {
            setIsModalOpen(true);
          } else {
            history.back();
          }
        }}
        className="bg-bg! shadow-none"
      />
      {isEditing &&
        createPortal(
          <Modal
            isOpen={isModalOpen}
            icon={<ExclamationTriangleIcon className="w-6 stroke-error" />}
            title={"Discard Changes?"}
            subtitle={"You have unsaved changes that will be lost."}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => history.back()}
            confirmClassName={"gradient-button-red"}
            confirmLabel={"Discard"}
            cancelLabel={"Keep Editing"}
          ></Modal>,
          document.body,
        )}
      <main className="absolute left-0 right-0 top-18 bottom-0 h-[calc(100dvh-72px)] pt-3 flex flex-col gap-6 overflow-y-auto ">
        <section className="grid grid-cols-1 gap-6 justify-between h-full ">
          <div className="flex flex-col items-center justify-end gap-4">
            <div className="border-5 rounded-full max-h-40 max-w-40 border-accent shadow-xl overflow-hidden flex items-center justify-center ">
              <Image
                src={"/picture.jpg"}
                width={143}
                height={140}
                alt="Profile picture"
              />
            </div>
            <div className="text-center ">
              {isLoading ? (
                <Skeleton width={150} />
              ) : isError ? (
                <p className="font-semibold text-lg">Something went wrong</p>
              ) : (
                <p className="font-semibold text-lg">
                  {formatFullName(data?.user)}
                </p>
              )}
            </div>
          </div>

          <div
            className="mt-2 bg-white p-8 rounded-t-4xl flex flex-col gap-6"
            style={{ border: "0.5px solid var(--color-border)" }}
          >
            {isLoading ? (
              <div className="flex flex-col gap-3 md:max-w-xl md:mx-auto">
                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    First name
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Middle name
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Last name
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Phone number
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Address
                  </label>
                  <Skeleton width={200} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Sitio
                  </label>
                  <Skeleton width={50} />
                </div>

                <div className="flex flex-col gap-1 border-b border-border p-2.5 text-sm">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Registered Barangay
                  </label>
                  <Skeleton width={150} />
                </div>
                <Skeleton width={320} />
                <Skeleton width={170} />
              </div>
            ) : isError ? (
              <Error
                subtext={"We coudn't get your personal information"}
                handleRefetchCount={handleRefetchCount}
              />
            ) : (
              <div className="flex flex-col gap-3 md:max-w-xl md:mx-auto">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="firstName"
                    className="text-start font-medium text-base"
                  >
                    First name{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Set your first name"
                    className={`input mb-0 text-base ${!isEditing && "text-gray-400"}`}
                    value={formData.firstName}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                  {errors?.firstName && (
                    <p className="text-xs text-red-400">{errors?.firstName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="middleName"
                    className="text-start font-medium text-base"
                  >
                    Middle name{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="middleName"
                    type="text"
                    placeholder="Set your middle name"
                    className={`input mb-0 text-base ${!isEditing && "text-gray-400"}`}
                    value={formData.middleName}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("middleName", e.target.value)}
                  />
                  {errors?.middleName && (
                    <p className="text-xs text-red-400">{errors?.middleName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="lastName"
                    className="text-start font-medium text-base"
                  >
                    Last name{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Set your last name"
                    className={`input mb-0 text-base ${!isEditing && "text-gray-400"}`}
                    value={formData.lastName}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                  {errors?.lastName && (
                    <p className="text-xs text-red-400">{errors?.lastName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="phoneNumber"
                    className="text-start font-medium text-base"
                  >
                    Phone number{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Set your phone number"
                    className={`input mb-0 text-base ${!isEditing && "text-gray-400"}`}
                    value={formData.phoneNumber}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  />
                  {errors?.phoneNumber && (
                    <p className="text-xs text-red-400">
                      {errors?.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Hidden when the resident has no sitio */}
                {data?.user?.sitio && (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-start font-medium text-base"
                    >
                      Sitio
                    </label>
                    <input
                      type="text"
                      className="input mb-0 text-base"
                      disabled={true}
                      value={data?.user?.sitio}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor=""
                    className="text-start font-medium text-base"
                  >
                    Registered Barangay
                  </label>
                  <input
                    type="text"
                    className="input mb-0 text-base"
                    disabled={true}
                    value={data?.user?.barangay}
                  />
                </div>
                <p className="text-sm text-gray-400 italic">
                  {data?.user?.sitio ? "Sitio and barangay" : "Barangay"} cannot
                  be changed. Contact your barangay for updates
                </p>
                <AnimatePresence>
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-accent text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      Save Changes
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>
    </Page>
  );
}
