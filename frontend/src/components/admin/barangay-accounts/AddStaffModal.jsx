"use client";

import { Modal } from "@/components/ui/Modal";
import { AdminInput } from "@/components/ui/AdminInput";
import { AdminLabel } from "@/components/ui/AdminLabel";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { STAFF_ROLES } from "@/lib/staffRoles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaceSmileIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

// UI scaffolding only — submit/validation/fetch wiring intentionally
// left out for now.

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  role: yup
    .string()
    .oneOf(
      ["CAPTAIN", "SECRETARY", "TREASURER", "COLLECTOR", "SK"],
      "Please choose a valid role",
    )
    .required("Role is required"),
  phoneNumber: yup
    .string()
    .matches(/^09\d{9}$/, "Enter a valid 11-digit phone number")
    .required("Phone number is required"),
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export const AddStaffModal = ({
  isOpen,
  onClose,
  handleStaffRefetchCount,
  barangayId,
}) => {
  const { makeRequest } = useMutation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      phoneNumber: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    toast.loading("Staff registration on progress");
    const success = await makeRequest({
      url: `/api/admin/barangays/${barangayId}/staff`,
      body: data
    });

    if (success) {
      toast.dismiss();
      toast.success("Staff registered");
      handleStaffRefetchCount();
      onClose();
    } else {
      toast.dismiss();
      toast.error("Staff registration failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<UserGroupIcon className="w-6 stroke-admin-accent" />}
      title="Add Staff"
      subtitle="Create a new staff login for this barangay"
      confirmLabel="Register Staff"
      confirmClassName="gradient-button-admin transition-all duration-200 ease-in-out"
      confirmType="sumbit"
      formOnSubmit={handleSubmit(onSubmit)}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="staffFirstName">First name</AdminLabel>
            <AdminInput
              id="staffFirstName"
              type="text"
              placeholder="Enter first name"
              {...register("firstName")}
            />
            {errors?.firstName && (
              <p className="text-xs text-start text-red-400">
                {errors?.firstName?.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <AdminLabel htmlFor="staffLastName">Last name</AdminLabel>
            <AdminInput
              id="staffLastName"
              type="text"
              placeholder="Enter last name"
              {...register("lastName")}
            />
            {errors?.lastName && (
              <p className="text-xs text-start text-red-400">
                {errors?.lastName?.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <AdminLabel htmlFor="staffRole">Role</AdminLabel>
          <div className="input mb-0 focus-within:outline-admin-accent">
            <select
              id="staffRole"
              className="w-full outline-none bg-transparent"
              defaultValue=""
              {...register("role")}
            >
              <option value="" disabled hidden>
                Select a role
              </option>
              {STAFF_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {errors?.role && (
            <p className="text-xs text-start text-red-400">
              {errors?.role?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <AdminLabel htmlFor="staffContactNumber">Phone number</AdminLabel>
          <AdminInput
            id="staffContactNumber"
            type="text"
            placeholder="Enter phone number"
            {...register("phoneNumber")}
          />
          {errors?.phoneNumber && (
            <p className="text-xs text-start text-red-400">
              {errors?.phoneNumber?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <AdminLabel htmlFor="staffUsername">Username</AdminLabel>
          <AdminInput
            id="staffUsername"
            type="text"
            placeholder="Enter username"
            {...register("username")}
          />
          {errors?.username && (
            <p className="text-xs text-start text-red-400">
              {errors?.username?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <AdminLabel htmlFor="staffPassword">Password</AdminLabel>
          <div className="input flex flex-row justify-between duration-300 ease-in-out mb-0 focus-within:outline-admin-accent">
            <input
              type={isPasswordVisible ? "text" : "password"}
              id="staffPassword"
              className="outline-none max-w-full min-w-[70%] "
              placeholder="Enter password"
              {...register("password")}
            />
            <button
              type="button"
              className="hover:cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
          {errors?.password && (
            <p className="text-xs text-start text-red-400">
              {errors?.password?.message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
