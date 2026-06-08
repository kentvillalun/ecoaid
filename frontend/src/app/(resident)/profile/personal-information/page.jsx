"use client";

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

export default function PersonalInformationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const url = `/api/resident/me`;
  const [refetchCount, setRefetchCount] = useState(0);
  const { isLoading, isError, data } = useFetch({ url, refetchCount });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const { makeRequest } = useMutation();

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data?.user?.firstName,
        lastName: data?.user?.lastName,
        phoneNumber: data?.user?.phoneNumber,
      });
    }
  }, [data]);

  return (
    <Page className="bg-new-bg!">
      <ResidentHeader
        title={"Personal Information"}
        action={"edit"}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        handleClick={() => {
          if (isEditing) {
            setIsModalOpen(true);
          } else {
            history.back();
          }
        }}
        className="bg-new-bg! shadow-none"
      />
      {isEditing &&
        createPortal(
          <Modal
            isOpen={isModalOpen}
            icon={<ExclamationTriangleIcon className="w-6 stroke-black" />}
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
            <div className="border-5 rounded-full max-h-40 max-w-40 border-cta-color shadow-xl overflow-hidden flex items-center justify-center ">
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
                  {data?.user?.firstName} {data?.user?.lastName}
                </p>
              )}
            </div>
          </div>

          <div
            className="mt-2 bg-white p-8 rounded-t-4xl flex flex-col gap-6"
            style={{ border: "0.5px solid #e5e7eb" }}
          >
            {isLoading ? (
              <div className="flex flex-col gap-3 md:max-w-xl md:mx-auto">
                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
                    First name
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
                    Last name
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
                    Phone number
                  </label>
                  <Skeleton width={150} />
                </div>

                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
                    Address
                  </label>
                  <Skeleton width={200} />
                </div>

                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
                    Sitio
                  </label>
                  <Skeleton width={50} />
                </div>

                <div className="flex flex-col gap-1 border-b border-[#E7E3E0] p-2.5 text-sm">
                  <label htmlFor="" className="text-start font-medium">
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-start font-medium text-base"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      className={` ${!isEditing && "text-gray-400"} outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base`}
                      value={formData.firstName}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-start font-medium text-base"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      className={` ${!isEditing && "text-gray-400"} outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base`}
                      value={formData.lastName}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="" className="text-start font-medium">
                    Phone number
                  </label>
                  <input
                    type="number"
                    className={` ${!isEditing && "text-gray-400"} outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base`}
                    value={formData.phoneNumber}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="" className="text-start font-medium">
                    Sitio
                  </label>
                  <input
                    type="text"
                    className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base"
                    disabled={true}
                    value={data?.user?.sitio}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="" className="text-start font-medium">
                    Registered Barangay
                  </label>
                  <input
                    type="text"
                    className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base"
                    disabled={true}
                    value={data?.user?.barangay}
                  />
                </div>
                <p className="text-sm text-gray-400 italic">
                  Sitio and barangay cannot be changed. Contact your barangay
                  for updates
                </p>
                <AnimatePresence>
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-cta-color text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                      onClick={async () => {
                        toast.loading("Updating personal information");
                        console.log(formData);
                        const success = await makeRequest({
                          url,
                          method: "PATCH",
                          body: formData,
                        });

                        if (success) {
                          toast.dismiss();
                          toast.success("Update successful");
                          handleRefetchCount();
                          setIsEditing(false);
                        } else {
                          toast.dismiss();
                          toast.error("Update failed");
                        }
                      }}
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
