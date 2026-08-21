"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { BARANGAY_ROLES } from "@/lib/roles";
import Image from "next/image";
import { LogoWithName } from "@/components/branding/LogoWithName";
import { ButtonSpinner } from "@/components/ui/buttonSpinner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export default function BarangayLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/barangay/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Login failed");
        return;
      }

      if (!BARANGAY_ROLES.includes(result.user?.role)) {
        setErrorMessage("This page is for barangay staff login only.");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("There is a problem fetching the data");
      return;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main
      className={`min-h-svh flex items-center justify-center w-full bg-bg  ${inter.className} `}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center">
          <LogoWithName nameSize="text-[42px]" />
          <p className="text-base md:text-base text-gray-600">
            Barangay Admin Portal
          </p>
        </div>
        <div className=" bg-surface p-10 rounded-4xl flex flex-col gap-8 new-border md:min-w-171 md:max-w-172.5 text-text-primary">
          <div className="flex flex-col justify-center items-start">
            <h3 className="text-2xl font-semibold">Sign In</h3>
            <p className="text-sm text-gray-600">
              Manage your barangay's recycling program
            </p>
          </div>
          <form
            className="flex flex-col gap-8 "
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor=""
                  className="text-text-primary font-medium text-base text-start"
                >
                  Username
                </label>
                <input
                  type="text"
                  className="input duration-300 ease-in-out text-base mb-0"
                  placeholder="Enter your username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-red-500 text-start">
                    {errors.username?.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor=""
                  className="text-text-primary font-medium text-base text-start"
                >
                  Password
                </label>
                <div className="input flex flex-row justify-between duration-300 ease-in-out mb-0">
                  <input
                    type={showPassword ? `text` : `password`}
                    className="outline-none max-w-full min-w-[70%] "
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="hover:cursor-pointer "
                    onClick={() => {
                      setShowPassword((prev) => !prev);
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 text-start">
                    {errors.password?.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-500 text-start">
                  {errorMessage}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 justify-center ">
              <button
                className="bg-accent text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button hover:cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>Log In</p>
                    <ButtonSpinner />
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="text-xs text-gray-400">
          EcoAid &copy; 2026 — Bararangay Recycling Management
        </p>
      </div>
    </main>
  );
}
