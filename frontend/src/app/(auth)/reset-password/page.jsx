"use client";

import { Inter } from "next/font/google";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { API_BASE_URL } from "@/lib/config";
import { DesktopGuard } from "@/components/ui/DesktopGuard";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Token and phone from sessionStorage ──────────────────────
  // These were set by the OTP page after successful verification.
  // We hold them in state so they're available when the form submits.
  const [resetToken, setResetToken] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);

  // ── Read sessionStorage on mount ─────────────────────────────
  // Must be done inside useEffect because sessionStorage doesn't
  // exist during server-side rendering.
  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    const phone = sessionStorage.getItem("pendingPhone");

    // If either is missing, the user didn't come through the proper flow
    if (!token || !phone) {
      router.replace("/forgot-password");
      return;
    }

    setResetToken(token);
    setPendingPhone(phone);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    setSubmitError("");

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        phoneNumber: pendingPhone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Clean up all password-reset related data from sessionStorage
    sessionStorage.removeItem("resetToken");
    sessionStorage.removeItem("pendingPhone");

    // Show a success message on the login page
    sessionStorage.setItem(
      "authSuccessMessage",
      "Password reset! You can now log in.",
    );
    sessionStorage.setItem("skipSplash", "true");
    router.push("/login");
  };

  return (
    <>
      <DesktopGuard />
      <Page gradient={true} className="lg:hidden">
        <div
          className={`w-full max-w-md min-h-svh flex flex-col justify-between px-1 ${inter.className}`}
        >
          <div className=""></div>
          <div className=""></div>

          <div className="flex justify-end items-end">
            <img
              src="/onboarding/Ecoprofit logo.svg"
              alt="EcoProfit Logo"
              className="aspect-4/2 object-cover"
            />
          </div>

          <form
            className="mx-1 mt-2 bg-white p-8 rounded-t-[20px] flex flex-col gap-8 max-w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h3 className="font-semibold text-[20px]">Reset Password</h3>

            <div className="flex flex-col gap-6 text-[#717680]">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5 justify-between">
                  <div className="flex flex-row gap-3 flex-1 min-w-0">
                    <LockClosedIcon className="h-6 w-6 shrink-0 stroke-[#4C5F66]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      className="outline-none w-full min-w-0 max-w-40 md:max-w-full"
                      {...register("password")}
                    />
                  </div>
                  <button
                    type="button"
                    className="hover:cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    Show
                  </button>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.password?.message}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5 justify-between">
                  <div className="flex flex-row gap-3 flex-1 min-w-0">
                    <LockClosedIcon className="h-6 w-6 shrink-0 stroke-[#4C5F66]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="outline-none w-full min-w-0 max-w-40 md:max-w-full"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <button
                    type="button"
                    className="hover:cursor-pointer"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    Show
                  </button>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.confirmPassword?.message}
                </p>
              </div>

              {submitError && (
                <p className="text-[14px] text-red-500">{submitError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.25 justify-center items-center">
              <button
                type="submit"
                disabled={isSubmitting || !resetToken}
                className="bg-primary text-white font-medium py-4 px-24 rounded-[40px] disabled:opacity-50 text-center"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>

              <Link
                className="text-[14px] text-center text-[#4C5F66]"
                href="/login"
                onClick={() => {
                  sessionStorage.setItem("skipSplash", "true");
                }}
              >
                Back to <span className="font-medium text-black">Log In</span>
              </Link>
            </div>
            <div className=""></div>
            <div className=""></div>
            <div className=""></div>
            <div className=""></div>
          </form>
        </div>
      </Page>
    </>
  );
}
