"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Page } from "@/components/layout/Page";
import { API_BASE_URL } from "@/lib/config";
import Image from "next/image";
import { DesktopGuard } from "@/components/ui/DesktopGuard";
import { motion } from "motion/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const message = window.sessionStorage.getItem("authSuccessMessage");

    if (message) {
      setSuccessMessage(message);
      window.sessionStorage.removeItem("authSuccessMessage");
    }
  }, []);

  const onSubmit = async (data) => {
    setSubmitError("");
    setSuccessMessage("");

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error || "Login failed");
      return;
    }

    if (result.data?.role !== "RESIDENT") {
      setSubmitError("This page is for resident login only.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ecoprofitResidentSession",
        JSON.stringify(result.data),
      );
    }

    router.push("/home");
  };

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid || sessionStorage.getItem("skipSplash")) {
      sessionStorage.removeItem("skipSplash");

      if (localStorage.getItem("ecoprofitResidentSession")) {
        router.push("/home");
        return;
      }

      // Checks if the user have seen the onboarding screen
      if (!localStorage.getItem("hasSeenOnboarding")) {
        router.push("/onboarding");
        return;
      }

      setIsChecking(false);
      return;
    }

    setTimeout(() => {
      setIsFading(true);

      setTimeout(() => {
        const checking = () => {
          // Checks if the user has already logged in, if yes redirect to home
          if (localStorage.getItem("ecoprofitResidentSession")) {
            router.push("/home");
            return;
          }

          // Checks if the user have seen the onboarding screen
          if (!localStorage.getItem("hasSeenOnboarding")) {
            router.push("/onboarding");
            return;
          }

          setIsChecking(false);
        };

        checking();
      }, 500);
    }, 1000);
  }, []);

  if (isChecking)
    return (
      <>
        <DesktopGuard />
        <main
          className={`min-h-svh overflow-x-hidden flex items-center justify-center bg-new-primary ${inter.className} ${isFading ? "opacity-0" : "opacity-100"} transition-opacity duration-500 lg:hidden`}
        >
          <div
            className={`flex flex-col items-center w-full max-w-md gap-25 p-2 justify-center`}
          >
            <div className="max-w-55 relative w-full aspect-square">
              <Image
                src="/ecoaid-logo/white-logo-wordmark.svg"
                alt="EcoAid logo"
                fill
                priority
              />
            </div>
            <div className=""></div>
          </div>
        </main>
      </>
    );

  return (
    <>
      <DesktopGuard />
      {!isChecking && (
        <Page className="lg:hidden bg-new-bg!">
          <div className={`min-w-full flex flex-col justify-end`}>
            <form
              className="min-h-auto bg-white p-8 rounded-t-4xl flex flex-col relative justify-center max-w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="-top-6 left-6 absolute rounded-full bg-new-primary w-16 h-16 flex items-center justify-center">
                <div className="w-8 relative aspect-square ">
                  <Image
                    src="/ecoaid-logo/ecoaid-green-logo.png"
                    alt="EcoAid logo"
                    fill
                    priority
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col w-full relative justify-center md:max-w-xl mx-auto"
              >
                <h3 className="font-semibold text-2xl mt-10">Sign In</h3>

                <div className="flex flex-col gap-6 text-[#717680] my-10">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-text-primary text-base font-medium"
                    >
                      Username
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Input username"
                        className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base"
                        {...register("username")}
                      />

                      {errors.username?.message && (
                        <p className="text-xs text-red-500">
                          {errors.username?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-base text-text-primary font-medium"
                    >
                      Password
                    </label>
                    <div className="flex flex-row gap-3.25 justify-between outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-cta-color transition-colors text-base">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Input password"
                        className="outline-none w-full min-w-0  md:max-w-full text-base"
                        {...register("password")}
                      />

                      <button
                        type="button"
                        className="hover:cursor-pointer"
                        onClick={() => {
                          setShowPassword((prev) => !prev);
                        }}
                      >
                        Show
                      </button>
                    </div>
                    {errors?.password?.message && (
                      <p className="text-xs text-red-500">
                        {errors.password?.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-500">{submitError}</p>
                  )}

                  {successMessage && (
                    <p className="text-xs text-green-600 text-center">
                      {successMessage}
                    </p>
                  )}

                  <button
                    className="bg-cta-color text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </button>

                  <Link
                    className="text-center text-cta-color font-medium text-sm"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>

                  <Link
                    className=" text-center text-text-primary font-medium text-sm"
                    href="/signup"
                  >
                    Don't have an account?{" "}
                    <span className="font-medium text-cta-color">Sign Up</span>
                  </Link>
                </div>
              </motion.div>
            </form>
          </div>
        </Page>
      )}
    </>
  );
}
