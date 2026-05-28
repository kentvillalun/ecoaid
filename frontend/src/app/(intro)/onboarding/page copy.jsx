"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DesktopGuard } from "@/components/ui/DesktopGuard";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");

    if (hasSeen) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <DesktopGuard />

      <main
        className={`lg:hidden min-h-svh overflow-x-hidden flex items-center justify-center bg-linear-to-b from-[#FFFFFF]  from-24% to-[#89D957] ${inter.className}`}
      >
        <div
          className={`${step === 1 ? "flex" : "hidden"} flex-col items-center w-full max-w-md gap-25 p-2 justify-center`}
        >
          <div className="max-w-108 relative w-full aspect-square">
            <Image
              src="/onboarding/Ecoprofit logo.svg"
              alt="EcoProfit Logo"
              fill
              priority
            />
          </div>
          <div className="">
            <button
              className="bg-primary min-w-63.75 min-h-13.5 rounded-[40px] font-poppins text-white font-medium text-base"
              onClick={() => {
                setStep(step + 1);
              }}
            >
              Get Started
            </button>
          </div>
        </div>

        <div
          className={`flex-col justify-between min-h-svh w-full max-w-md p-4 pt-12 pb-10 overflow-x-hidden ${step === 2 ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col items-center w-full max-w-md p-2 justify-center ">
            <div className="max-w-108 relative w-full aspect-square">
              <Image src={"/onboarding/step1.svg"} alt="Step 1" fill priority />
            </div>
            <h3 className="text-[22px] max-w-88.75 text-center mb-6.25 font-medium">
              Recyclables Go to Waste Without a Clear System
            </h3>
            <p className="text-[14px] text-center">
              Many households want to help, but without a proper way to collect
              and track recyclables, usable materials end up in the trash
              instead of benefiting the community.
            </p>
          </div>
          <div className="">
            <div className="flex justify-between p-6 text-[14px]">
              <Link
                className="font-medium"
                href="/login"
                onClick={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  sessionStorage.setItem("skipSplash", "true");
                  document.cookie = "hasSeenOnboarding=true; path=/";
                }}
              >
                Skip
              </Link>
              <button
                className="font-medium"
                onClick={() => {
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            </div>
            <div className="flex justify-center gap-3">
              <div className="h-2.5 w-2.5 bg-black rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-[#48484856] rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-[#48484856] rounded-full"></div>
            </div>
          </div>
        </div>

        <div
          className={`flex-col justify-between min-h-svh w-full max-w-md p-4 pt-12 pb-10 overflow-x-hidden ${step === 3 ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col items-center w-full max-w-md p-2 justify-center ">
            <div className="max-w-108 relative w-full aspect-square">
              <Image src={"/onboarding/step2.svg"} alt="Step 2" fill priority />
            </div>
            <h3 className="font-medium text-[22px] max-w-86 text-center mb-6.25">
              Your recyclables have value. Benefit from them
            </h3>
            <p className="text-[14px] text-center">
              Every recyclable counts. Turn yours into value and earn rewards,
              recognition, or incentives along the way, all recorded and tracked
              transparently.
            </p>
          </div>
          <div className="">
            <div className="flex justify-between p-6 text-[14px]">
              <Link
                className="font-medium"
                href="/login"
                onClick={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  sessionStorage.setItem("skipSplash", "true");
                  document.cookie = "hasSeenOnboarding=true; path=/";
                }}
              >
                Skip
              </Link>
              <button
                className="font-medium"
                onClick={() => {
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            </div>
            <div className="flex justify-center gap-3">
              <div className="h-2.5 w-2.5 bg-[#48484856]  rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-black rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-[#48484856] rounded-full"></div>
            </div>
          </div>
        </div>

        <div
          className={`flex-col justify-between min-h-svh w-full max-w-md p-4 pt-12 pb-10 font-poppins overflow-x-hidden ${step === 4 ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col items-center w-full max-w-md p-2 justify-center ">
            <div className="max-w-108 relative w-full aspect-square">
              <Image src={"/onboarding/step3.svg"} alt="Step 3" fill priority />
            </div>
            <h3 className="font-poppins font-medium text-[22px] max-w-86 text-center mb-6.25">
              How EcoProfit Works
            </h3>
            <p className="text-[14px] text-center">
              Submit a pickup request through the app, wait for barangay
              approval, have your recyclables collected and sorted, then earn
              rewards through your barangay's redemption program.
            </p>
          </div>
          <div className="">
            <div className="flex justify-between p-6 text-[14px]">
              <Link
                className="font-medium"
                href="/login"
                onClick={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  sessionStorage.setItem("skipSplash", "true");
                  document.cookie = "hasSeenOnboarding=true; path=/";
                }}
              >
                Skip
              </Link>

              <Link
                className="font-medium"
                href="/login"
                onClick={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  sessionStorage.setItem("skipSplash", "true");
                  document.cookie = "hasSeenOnboarding=true; path=/";
                }}
              >
                Next
              </Link>
            </div>
            <div className="flex justify-center gap-3">
              <div className="h-2.5 w-2.5 bg-[#48484856] rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-[#48484856] rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
