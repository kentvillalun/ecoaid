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
import Image from "next/image";

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
      <Page className="lg:hidden bg-new-bg!">
        <div className={`min-w-full flex flex-col justify-end`}>
          <form
            className="min-h-auto bg-white p-8 rounded-t-4xl flex flex-col relative justify-center max-w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="-top-6 left-6 absolute rounded-full bg-new-primary w-16 h-16 flex items-center justify-center">
              <div className="w-8 relative aspect-square ">
                <Image
                  src="/ecoaid-logo/ecoaid-green-logo.svg"
                  alt="EcoAid logo"
                  fill
                  priority
                  loading="eager"
                />
              </div>
            </div>

            <div className="flex flex-col w-full relative justify-center md:max-w-xl mx-auto">
              <h3 className="font-semibold text-2xl mt-10">Reset Password</h3>

              <div className="flex flex-col gap-6 text-[#717680] my-10">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="newPassword"
                    className="text-text-primary text-base font-medium"
                  >
                    New Password
                  </label>
                  <div className="flex flex-row justify-between outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Input your new password"
                      id="newPassword"
                      className="outline-none w-full min-w-0 md:max-w-full flex-1 text-base"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="hover:cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.password?.message && (
                    <p className="text-xs text-red-500">
                      {errors.password?.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="" className="text-base text-text-primary font-medium">
                      Confirm new password
                    </label>
                  <div className="flex flex-row justify-between outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="outline-none w-full min-w-0 md:max-w-full text-base flex-1"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="hover:cursor-pointer"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="text-xs text-red-500">
                    {errors.confirmPassword?.message}
                  </p>
                </div>

                {submitError && (
                  <p className="text-xs text-red-500">{submitError}</p>
                )}
              </div>

              <div className="flex flex-col gap-4 justify-center mb-15">
                <button
                  type="submit"
                  disabled={isSubmitting || !resetToken}
                  className="bg-cta-color text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>

                <Link
                  className="text-sm text-center text-text-primary"
                  href="/login"
                  onClick={() => {
                    sessionStorage.setItem("skipSplash", "true");
                  }}
                >
                  Back to <span className="font-medium text-cta-color text-sm">Log In</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Page>
    </>
  );
}
