"use client";

import { Inter } from "next/font/google";
import { PhoneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { useState } from "react";
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
  phoneNumber: yup.string().required("Phone number is required"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { phoneNumber: "" },
  });

  const onSubmit = async (data) => {
    setSubmitError("");

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: data.phoneNumber }),
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Store what the OTP page needs to know about this flow.
    // otpFlow tells the OTP page to call verify-forgot-password-otp instead of verify-otp.
    sessionStorage.setItem("otpFlow", "forgot-password");
    sessionStorage.setItem("pendingPhone", data.phoneNumber);

    router.push("/otp");
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
            <h3 className="font-semibold text-[20px]">Forgot Password</h3>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-3 border-b border-[#E7E3E0] p-2.5">
                  <PhoneIcon className="h-6 w-6 shrink-0 stroke-[#4C5F66]" />
                  <input
                    type="text"
                    placeholder="Phone number"
                    className="outline-none w-full min-w-0 max-w-full"
                    {...register("phoneNumber")}
                  />
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.phoneNumber?.message}
                </p>
              </div>

              {submitError && (
                <p className="text-[14px] text-red-500">{submitError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.25 justify-center items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white font-medium py-4 px-24 rounded-[40px] max-w-63.75 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit"}
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
