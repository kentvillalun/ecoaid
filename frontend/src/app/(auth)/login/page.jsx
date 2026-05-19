"use client";

import { Inter } from "next/font/google";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
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
    console.log("login result:", result);
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
    console.log("role check passed, redirecting...");
    router.push("/home");
  };

  useEffect(() => {
    if (sessionStorage.getItem("skipSplash")) {
      sessionStorage.removeItem("skipSplash");
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
          className={`min-h-svh overflow-x-hidden flex items-center justify-center bg-linear-to-b from-[#FFFFFF]  from-24% to-[#89D957] ${inter.className} ${isFading ? "opacity-0" : "opacity-100"} transition-opacity duration-500 lg:hidden`}
        >
          <div
            className={`flex flex-col items-center w-full max-w-md gap-25 p-2 justify-center`}
          >
            <div className="max-w-108 relative w-full aspect-square">
              <Image
                src="/onboarding/Ecoprofit logo.svg"
                alt="EcoProfit Logo"
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
                className="aspect-4/2 object-cover "
              />
            </div>
            <form
              className="mx-1 mt-2 bg-white p-8 rounded-t-[20px] flex flex-col gap-8 max-w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <h3 className="font-semibold text-[20px]">Log In</h3>
              <div className="flex flex-col gap-6 text-[#717680]">
                <div className="flex flex-col gap-2">
                  <div className=" flex flex-row gap-3 border-b border-[#E7E3E0] p-2.5">
                    <UserIcon className="h-6 w-6 stroke-[#4C5F66]" />
                    <input
                      type="text"
                      placeholder="Username"
                      className="outline-none max-w-full w-full"
                      {...register("username")}
                    />
                  </div>
                  <p className="text-[14px] text-red-500">
                    {errors.username?.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5 text-[#717680] justify-between">
                    <div className="flex flex-row gap-3 flex-1 min-w-0">
                      <LockClosedIcon className="h-6 w-6 shrink-0 stroke-[#4C5F66]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="outline-none w-full min-w-0 max-w-40 md:max-w-full"
                        {...register("password")}
                      />
                    </div>
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
                  <p className="text-[14px] text-red-500">
                    {errors.password?.message}
                  </p>
                </div>

                {submitError ? (
                  <p className="text-[14px] text-red-500">{submitError}</p>
                ) : null}

                {successMessage ? (
                  <p className="text-[14px] text-green-600 text-center">
                    {successMessage}
                  </p>
                ) : null}

                <div className="flex items-end justify-end">
                  <Link
                    className="text-right text-[14px]"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex flex-col gap-1 justify-center items-center">
                  <button
                    className="bg-primary text-white font-medium py-3.75 px-24 rounded-[40px] disabled:opacity-70"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging In..." : "Log In"}
                  </button>

                  <Link
                    className="text-[14px] text-center text-[#4C5F66]"
                    href="/signup"
                  >
                    Don't have an account?{" "}
                    <span className="font-medium text-black">Sign Up</span>
                  </Link>
                </div>
                <div className=""></div>
                <div className=""></div>
              </div>
            </form>
          </div>
        </Page>
      )}
    </>
  );
}
