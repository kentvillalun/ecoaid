"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DesktopGuard } from "@/components/ui/DesktopGuard";
import { motion } from "motion/react";
import { Page } from "@/components/layout/Page";
import { PageTransition } from "@/components/ui/PageTransition";
import { haptic } from "@/lib/haptics";

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

      <Page className="bg-[#F8F8F8]!">
        <PageTransition
          key={"page"}
          className="flex flex-col items-center justify-between min-w-full pt-6 "
        >
          <div className="w-full flex flex-col items-center gap-3.5 min-h-18.75">
            <div className="w-full max-w-50 max-h-9.25 aspect-3/1 relative">
              <Image
                className="absolute"
                src={"/ecoaid-logo/logo-wordmark.svg"}
                fill
                priority
                alt="EcoAid logo"
              />
            </div>
            <div
              className={`${step === 3 ? "hidden" : "flex"} items-center justify-end w-full pr-4 md:px-15`}
            >
              <Link
                className="text-new-primary"
                href={"/login"}
                onClick={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  sessionStorage.setItem("skipSplash", "true");
                  document.cookie = "hasSeenOnboarding=true; path=/";
                }}
              >
                Skip
              </Link>
            </div>
          </div>

          <div className="overflow-hidden w-full flex-1">
            <motion.div
              key={"onboarding1"}
              className="flex flex-row h-full  w-full"
              animate={{ x: `${-(step - 1) * 100}vw` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Onboarding 1 */}

              <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
                <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                  <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
                    <Image
                      src={"/onboarding-2.0/onb1.png"}
                      alt="A girl beign frustrated that she is sorrounded by recyclable materials."
                      fill
                      priority
                      loading="eager"
                      className="z-50"
                    />

                    <div
                      className="xs:w-45 xs:h-45 mobile:w-55 mobile:h-55 md:w-70 md:h-70 bg-[#74C85740] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-3.5 w-full">
                  <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
                    <div className="col-span-2 h-1.25 bg-cta-color rounded-xl"></div>
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                  </div>

                  <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6 ">
                    <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          key={`headline-${step}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.35 }}
                        >
                          <h2 className="text-xl font-semibold text-center text-text-primary">
                            Recyclable Go to Waste Without a Clear System
                          </h2>
                        </motion.div>

                        <motion.div
                          key={`body-${step}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.45 }}
                        >
                          <p className="text-xs text-text-primary text-center">
                            Many households want to help, but without a proper
                            way to collect and track recyclables, usable
                            materials end up in the trash instead of benefiting
                            the community.
                          </p>
                        </motion.div>
                      </div>
                      <motion.div
                        className="w-full"
                        key={`button-${step}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.55 }}
                      >
                        <button
                          className="bg-cta-color w-full text-white font-medium mobile:py-5 xs:py-3.5 rounded-[14px] text-sm gradient-button"
                          onClick={() => {
                            setStep(step + 1);
                            haptic.light();
                          }}
                        >
                          Next
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding 2 */}

              <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
                <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                  <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
                    <Image
                      src={"/onboarding-2.0/onb2.png"}
                      alt="A girl and boy putting trashes in a container."
                      fill
                      priority
                      loading="eager"
                      className="z-50"
                    />

                    <div
                      className="xs:w-64 xs:h-45 mobile:w-90 mobile:h-55 md:w-110 md:h-70 bg-[#74C85740] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        borderRadius: "52% 48% 58% 42% / 38% 42% 52% 48%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-3.5 w-full">
                  <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                    <div className="col-span-2 h-1.25 bg-cta-color rounded-xl"></div>
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                  </div>

                  <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6">
                    {step === 2 && (
                      <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8">
                        <div className="flex flex-col items-center gap-2">
                          <motion.div
                            key={`headline-${step}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                          >
                            <h2 className="text-xl font-semibold text-center text-text-primary">
                              Your recyclables have value. Benefit from them
                            </h2>
                          </motion.div>

                          <motion.div
                            key={`body-${step}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.45 }}
                          >
                            <p className="text-xs text-text-primary text-center">
                              Every recyclable counts. Turn yours into value and
                              earn rewards, recognition, or incentives along the
                              way, all recorded and tracked transparently.
                            </p>
                          </motion.div>
                        </div>
                        <motion.div
                          className="w-full"
                          key={`button-${step}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.55 }}
                        >
                          <button
                            className="bg-cta-color w-full text-white font-medium xs:py-3.5 mobile:py-5 rounded-[14px] text-sm gradient-button"
                            onClick={() => {
                              setStep(step + 1);
                              haptic.light();
                            }}
                          >
                            Next
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Onboarding 3 */}

              <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
                <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                  <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
                    <Image
                      src={"/onboarding-2.0/onb3.png"}
                      alt="A girl and boy putting trashes in a container."
                      fill
                      priority
                      loading="eager"
                      className="z-50"
                    />

                    <div
                      className="xs:w-48 xs:h-52 mobile:w-65 mobile:h-72 md:w-80 md:h-90 bg-[#74C85740] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        borderRadius: "45% 55% 50% 50% / 55% 45% 60% 40%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-3.5 w-full">
                  <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                    <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
                    <div className="col-span-2 h-1.25 bg-cta-color rounded-xl"></div>
                  </div>
                  <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6">
                    {step === 3 && (
                      <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8">
                        <div className="flex flex-col items-center gap-2">
                          <motion.div
                            key={`headline-${step}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                          >
                            <h2 className="text-xl font-semibold text-center text-text-primary">
                              How EcoAid Works
                            </h2>
                          </motion.div>

                          <motion.div
                            key={`body-${step}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.45 }}
                          >
                            <p className="text-xs text-text-primary text-center">
                              Snap a photo of your recyclables, requests a
                              pickup, and get collected by the barangay. Every
                              contribution earns your points, a spot on the
                              communiity leaderboard, and keep community clean.
                            </p>
                          </motion.div>
                        </div>
                        <motion.div
                          className="w-full"
                          key={`button-${step}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.55 }}
                        >
                          <Link
                            className="bg-cta-color w-full text-white font-medium mobile:py-5 xs:py-3.5 rounded-[14px] block text-center text-sm gradient-button"
                            onClick={() => {
                              localStorage.setItem("hasSeenOnboarding", "true");
                              sessionStorage.setItem("skipSplash", "true");
                              document.cookie =
                                "hasSeenOnboarding=true; path=/";
                              haptic.light();
                            }}
                            href={"/login"}
                          >
                            Get Started
                          </Link>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </PageTransition>
      </Page>
    </>
  );
}
