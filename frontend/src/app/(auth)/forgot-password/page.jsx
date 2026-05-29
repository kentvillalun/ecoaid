"use client";

import { ArrowLeftIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { API_BASE_URL } from "@/lib/config";
import { DesktopGuard } from "@/components/ui/DesktopGuard";
import Image from "next/image";

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

      <Page className="lg:hidden bg-new-bg">
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

            <div className="flex flex-col w-full relative justify-center md:max-w-xl mx-auto mb-40">
              <div className="flex flex-row gap-4 h-full w-full items-center mt-10">
                <button
                  className=""
                  onClick={() => {
                    history.back();
                    sessionStorage.setItem("skipSplash", "true");
                  }}
                  type="button"
                >
                  <ArrowLeftIcon className="w-7 stroke-cta-color" />
                </button>
                <h3 className="font-semibold text-2xl">Forgot Password</h3>
              </div>

              <div className="flex flex-col gap-4 text-[#717680] my-10">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact"
                    className="text-base text-text-primary font-medium"
                  >
                    Phone number
                  </label>
                  <input
                    id="contact"
                    type="text"
                    placeholder="09xxxxxxxxx"
                    className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base"
                    {...register("phoneNumber")}
                  />
                  {errors.phoneNumber?.message && (
                    <p className="text-xs text-red-500">
                      {errors.phoneNumber?.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="text-xs text-red-500">{submitError}</p>
                )}
              </div>
              <div className="flex flex-col gap-4 ">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cta-color text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Page>
    </>
  );
}
