"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { DesktopGuard } from "@/components/ui/DesktopGuard";
import Image from "next/image";

// Outside component — only created once, never recreated on rerender
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// How many seconds the user must wait before resending
const RESEND_COOLDOWN = 60;

export default function OtpPage() {
  const router = useRouter();

  // ── OTP digits ────────────────────────────────────────────────
  // We store each digit separately in an array of 6 empty strings.
  // When joined together they form the full 6-digit code.
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);

  // ── Refs for each input ───────────────────────────────────────
  // useRef gives us direct access to the DOM input elements.
  // We need this to programmatically move focus between boxes
  // when the user types or deletes a digit.
  // useRef does NOT cause a rerender when it changes — unlike useState.
  const inputRefs = useRef([]);

  // ── Flow type and registration data from sessionStorage ───────
  // otpFlow tells us whether we came from signup or forgot-password.
  // pendingData is only needed for signup (holds barangayId, sitioId, etc.)
  const [otpFlow, setOtpFlow] = useState("signup");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingData, setPendingData] = useState(null);

  // ── UI state ──────────────────────────────────────────────────
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Resend cooldown ───────────────────────────────────────────
  // countdown starts at 60 and ticks down every second.
  // When it hits 0, the resend button becomes active.
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // ── Read sessionStorage on mount ─────────────────────────────
  // useEffect with empty [] runs once when the component first loads.
  // We read sessionStorage here instead of at the top level because
  // sessionStorage is a browser API — it doesn't exist on the server.
  // Next.js renders components on the server first, so any browser
  // API must be accessed inside useEffect, not at the top level.
  useEffect(() => {
    const phone = sessionStorage.getItem("pendingPhone");
    const flow = sessionStorage.getItem("otpFlow") ?? "signup";
    const registration = sessionStorage.getItem("pendingRegistration");

    if (flow === "forgot-password") {
      // Forgot-password flow only needs the phone number
      if (!phone) {
        router.replace("/forgot-password");
        return;
      }
      setPendingPhone(phone);
      setOtpFlow("forgot-password");
    } else {
      // Signup flow needs both phone and full registration data
      if (!phone || !registration) {
        router.replace("/signup");
        return;
      }
      setPendingPhone(phone);
      setPendingData(JSON.parse(registration));
      setOtpFlow("signup");
    }
  }, []);

  // ── Countdown timer ───────────────────────────────────────────
  // Runs every second while countdown is above 0.
  // The cleanup function (return) clears the interval when the
  // component unmounts or when countdown changes.
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      // prev is the current value of countdown
      // We use the functional form to avoid stale state
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Cleanup: clear the interval when effect reruns or component unmounts
    return () => clearInterval(interval);
  }, [countdown]);

  // ── Handle digit input ────────────────────────────────────────
  const handleChange = (index, value) => {
    // Only allow single digits 0-9
    // /^\d$/ is a regex: ^ means start, \d means digit, $ means end
    // This ensures only one numeric character passes through
    if (value && !/^\d$/.test(value)) return;

    // Update the digit at this index
    const newDigits = [...digits]; // spread creates a copy so we don't mutate state directly
    newDigits[index] = value;
    setDigits(newDigits);
    setSubmitError("");

    // Auto-advance: if a digit was typed and there's a next input, focus it
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      // ?. is optional chaining — if inputRefs.current[index + 1] is
      // undefined, it won't crash, it just does nothing
    }
  };

  // ── Handle backspace ──────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    // When backspace is pressed on an empty input, go back to previous
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Handle paste ──────────────────────────────────────────────
  // User can paste the full 6-digit code and it fills all boxes
  const handlePaste = (e) => {
    e.preventDefault(); // stop default paste behavior

    // Get pasted text, remove non-digits, take first 6 characters
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus the input after the last pasted digit
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const code = digits.join(""); // combine ["4","8","2","9","3","1"] → "482931"

    if (code.length < 6) {
      setSubmitError("Please enter the complete 6-digit code");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (otpFlow === "forgot-password") {
        await handleForgotPasswordVerify(code);
      } else {
        await handleSignupVerify(code);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      // finally always runs whether try succeeded or catch ran
      setIsSubmitting(false);
    }
  };

  // ── Signup OTP verification ───────────────────────────────────
  const handleSignupVerify = async (code) => {
    if (!pendingData) {
      setSubmitError("Session expired. Please sign up again.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: pendingData.phoneNumber,
        code,
        barangayId: pendingData.barangayId,
        sitioId: pendingData.sitioId,
        password: pendingData.password,
        termsAccepted: pendingData.termsAccepted,
        username: pendingData.username,
        lastName: pendingData.lastName,
        firstName: pendingData.firstName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error ?? "Verification failed. Please try again.");
      return;
    }

    // Clean up sessionStorage — we don't need this data anymore
    sessionStorage.removeItem("pendingPhone");
    sessionStorage.removeItem("pendingRegistration");
    sessionStorage.removeItem("otpFlow");

    // Registration complete — go to login
    sessionStorage.setItem(
      "authSuccessMessage",
      "Account created! You can now log in.",
    );
    sessionStorage.setItem("skipSplash", "true");
    router.push("/login");
  };

  // ── Forgot-password OTP verification ─────────────────────────
  const handleForgotPasswordVerify = async (code) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-forgot-password-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: pendingPhone, code }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error ?? "Verification failed. Please try again.");
      return;
    }

    // Store the reset token so the reset-password page can use it.
    // Keep pendingPhone because reset-password needs it to identify the account.
    sessionStorage.setItem("resetToken", result.data.token);
    sessionStorage.removeItem("otpFlow");

    router.push("/reset-password");
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0 || !pendingPhone) return;

    setIsResending(true);
    setResendMessage("");
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass otpFlow so the backend applies the right user-existence check
        body: JSON.stringify({ phoneNumber: pendingPhone, otpFlow }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "Failed to resend code.");
        return;
      }

      // Reset the digits so user starts fresh
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Restart the cooldown
      setCountdown(RESEND_COOLDOWN);
      setResendMessage("A new code has been sent.");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // ── JSX ───────────────────────────────────────────────────────
  return (
    <>
      <DesktopGuard />

      <Page className="lg:hidden bg-new-bg!">
        <div className={`min-w-full flex flex-col justify-end`}>
          <div className="min-h-auto bg-white p-8 rounded-t-4xl flex flex-col relative justify-center max-w-full">
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

            <div className="flex flex-col w-full relative justify-center md:max-w-xl mx-auto gap-10 mb-20">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-2xl mt-10">
                  OTP Verification
                </h3>
                <p className="text-text-primary text-base">
                  We have sent a verification code to{" "}
                  {/* Show the phone number so user knows where the OTP was sent */}
                  <span className="font-medium text-black">
                    {pendingPhone || "your number"}
                  </span>
                </p>
              </div>

              {/* ── 6 digit inputs ── */}
              <div className="flex flex-row justify-center gap-1.75 flex-wrap">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    // inputMode="numeric" shows the number keyboard on mobile
                    // without using type="number" which has unwanted behavior
                    maxLength={1}
                    value={digit}
                    className="outline h-10 w-10 outline-[#E7E3E0] focus:outline-cta-color transition-colors duration-150 ease-in-out rounded-[5px] p-3 text-center"
                    // ref callback: stores each input element in the array
                    // so we can call .focus() on them programmatically
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                  />
                ))}
              </div>

              {/* ── Error message ── */}
              {submitError && (
                <p className="text-xs text-red-500 text-center">
                  {submitError}
                </p>
              )}

              {/* ── Resend success message ── */}
              {resendMessage && (
                <p className="text-xs text-green-600 text-center">
                  {resendMessage}
                </p>
              )}
              <div className="flex flex-col gap-6">
                <button
                  className="bg-cta-color text-white font-medium py-3.75 px-24 rounded-[14px] disabled:opacity-70 text-sm gradient-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </button>

                {/* ── Resend button with cooldown ── */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="text-sm text-text-primary font-medium disabled:opacity-50"
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
                      ? // Shows "Resend code in 60s" counting down to 0
                        `Resend code in ${countdown}s`
                      : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}
