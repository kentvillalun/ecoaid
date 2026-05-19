"use client";

import { Inter } from "next/font/google";
import {
  PhoneIcon,
  LockClosedIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  UserIcon,
  AtSymbolIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TermsModal } from "@/components/auth/TermsModal";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Page } from "@/components/layout/Page";
import { API_BASE_URL } from "@/lib/config";
import { DesktopGuard } from "@/components/ui/DesktopGuard";

// Defined outside the component so it never gets recreated on re-render
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must be at most 20 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup.string().required("Phone number is required"),

  barangayName: yup.string().required("Barangay is required"),

  barangayId: yup
    .string()
    .required("Please select a barangay from the suggestions"),

  sitioId: yup.string().required("Sitio or Purok is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(4, "Password must be at least 4 characters")
    .max(16, "Password must not exceed 16 characters"),

  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Password do not match"),

  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the Terms and Conditions to continue"),
});

export default function SignupPage() {
  const router = useRouter();

  // ── react-hook-form ────────────────────────────────────────────
  // register     → spread onto an <input> so the library tracks it
  // handleSubmit → wraps your onSubmit, runs validation first,
  //                only calls your function if everything passes
  // setValue     → manually set a field's value from code
  //                (needed for barangayId and barangayName since
  //                they aren't set by the user typing directly)
  // clearErrors  → manually remove a validation error
  // setError     → manually trigger a validation error
  // errors       → object with current error messages per field

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phoneNumber: "",
      barangayName: "",
      barangayId: "",
      sitioId: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  // ── UI state ───────────────────────────────────────────────────
  // These are separate from form field values.
  // Form field values are owned by react-hook-form above.
  // UI state (dropdowns, loading, modal) is owned by useState.
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Barangay autocomplete state
  const [barangayQuery, setBarangayQuery] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isBarangayLoading, setIsBarangayLoading] = useState(false);
  const [barangayError, setBarangayError] = useState("");

  // Sitio dropdown state
  const [sitioOptions, setSitioOptions] = useState([]);
  const [isSitioLoading, setIsSitioLoading] = useState(false);

  useEffect(() => {
    if (!barangayQuery.trim()) {
      setBarangayOptions([]);
      setBarangayError("");
      return;
    }

    if (selectedBarangay?.name === barangayQuery.trim()) {
      setBarangayOptions([]);
      return;
    }

    let isActive = true;

    const timeoutId = setTimeout(async () => {
      setIsBarangayLoading(true);
      setBarangayError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/barangays?search=${encodeURIComponent(barangayQuery.trim())}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load barangay");
        }

        if (isActive) setBarangayOptions(result.data ?? []);
      } catch (error) {
        if (isActive) {
          setBarangayOptions([]);
          setBarangayError(error.message);
        }
      } finally {
        if (isActive) setIsBarangayLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [barangayQuery, selectedBarangay]);

  useEffect(() => {
    if (!selectedBarangay?.id) {
      setSitioOptions([]);
      return;
    }

    let isActive = true;

    const loadSitios = async () => {
      setIsSitioLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/barangays/${selectedBarangay.id}/sitios`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load sitios");
        }

        if (isActive) setSitioOptions(result.data ?? []);
      } catch {
        if (isActive) setSitioOptions([]);
      } finally {
        if (isActive) setIsSitioLoading(false);
      }
    };

    loadSitios();

    return () => {
      isActive = false;
    };
  }, [selectedBarangay]);

  const handleBarangayInputChange = (value) => {
    setBarangayQuery(value);
    setShowSuggestions(true);
    setSubmitError("");

    setValue("barangayName", value, { shouldValidate: true });

    if (selectedBarangay && value.trim() !== selectedBarangay.name) {
      setSelectedBarangay(null);
      setValue("barangayId", "", { shouldValidate: true });
      setSitioOptions([]);
      setValue("sitioId", "");
      clearErrors("sitioId");
    }

    if (!value.trim()) {
      setSelectedBarangay(null);
      setValue("barangayId", "", { shouldValidate: true });
      setSitioOptions([]);
      setValue("sitioId", "");
    }
  };

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay);
    setBarangayQuery(barangay.name);
    setBarangayOptions([]);
    setShowSuggestions(false);
    setBarangayError("");

    setValue("barangayName", barangay.name, { shouldValidate: true });
    setValue("barangayId", barangay.id, { shouldValidate: true });
    clearErrors(["barangayName", "barangayId"]);

    setSitioOptions([]);
    setValue("sitioId", "");
    clearErrors("sitioId");
  };

  const onSubmit = async (data) => {
    setSubmitError("");

    if (
      !selectedBarangay?.id ||
      selectedBarangay.name !== data.barangayName.trim()
    ) {
      setError("barangayId", {
        message: "Please select a barangay from the suggestions",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phoneNumber: data.phoneNumber,
          barangayId: selectedBarangay.id,
          sitioId: data.sitioId,
          password: data.password,
          confirmPassword: data.confirmPassword,
          termsAccepted: data.termsAccepted,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "Signup failed. Please try again.");
        return;
      }

      sessionStorage.setItem("pendingPhone", data.phoneNumber);
      sessionStorage.setItem(
        "pendingRegistration",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phoneNumber: data.phoneNumber,
          barangayId: selectedBarangay.id,
          sitioId: data.sitioId,
          password: data.password,
          termsAccepted: true,
        }),
      );
      sessionStorage.setItem("otpFlow", "signup");

      router.push("/otp");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  // Checks if the user have seen the onboarding screen
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");

    if (!hasSeen) {
      router.push("/onboarding");
    }
  }, []);

  return (
    <>
      <DesktopGuard />
      <Page gradient={true} className="from-10%! lg:hidden">
        {isTermsOpen && (
          <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <TermsModal
              setIsTermsOpen={setIsTermsOpen}
              isTermsOpen={isTermsOpen}
            />
          </section>
        )}
        <div className="w-full max-w-md min-h-svh flex flex-col justify-between px-1">
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
            className="mx-1 mt-2 bg-white p-8 rounded-t-[20px] flex flex-col gap-4 max-w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-8">
              <h3 className={`font-semibold text-[20px] ${inter.className}`}>
                Sign Up
              </h3>

              <div className="flex flex-col gap-2 text-[#717680]">
                {/* First name */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                  <UserIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                  <input
                    type="text"
                    placeholder="First name"
                    className="outline-none max-w-full w-full min-w-0"
                    {...register("firstName")}
                  />
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.firstName?.message}
                </p>

                {/* Last name */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                  <UserIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="outline-none max-w-full w-full min-w-0"
                    {...register("lastName")}
                  />
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.lastName?.message}
                </p>

                {/* Username */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                  <AtSymbolIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                  <input
                    type="text"
                    placeholder="Username"
                    className="outline-none max-w-full w-full min-w-0"
                    {...register("username")}
                  />
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.username?.message}
                </p>

                {/* Phone number */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                  <PhoneIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />

                  <input
                    type="text"
                    placeholder="Phone number"
                    className="outline-none max-w-full w-full min-w-0"
                    {...register("phoneNumber")}
                  />
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.phoneNumber?.message}
                </p>

                {/* Barangay */}
                <input type="hidden" {...register("barangayId")} />
                <div className="relative">
                  <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                    <BuildingOffice2Icon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                    <input
                      type="text"
                      placeholder="Barangay"
                      className="outline-none max-w-full w-full min-w-0"
                      autoComplete="off"
                      value={barangayQuery}
                      {...register("barangayName")}
                      onChange={(e) =>
                        handleBarangayInputChange(e.target.value)
                      }
                      onFocus={() => {
                        if (barangayQuery.trim()) setShowSuggestions(true);
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                      }
                    />
                  </div>

                  {/* Dropdown will go here */}
                  {showSuggestions && barangayQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#E7E3E0] bg-white py-2 shadow-lg">
                      {isBarangayLoading && (
                        <p className="px-4 py-2 text-[14px] text-[#4C5F66]">
                          Loading barangays...
                        </p>
                      )}

                      {!isBarangayLoading && barangayError && (
                        <p className="px-4 py-2 text-[14px] text-red-500">
                          {barangayError}
                        </p>
                      )}

                      {!isBarangayLoading &&
                        !barangayError &&
                        barangayOptions.length === 0 && (
                          <p className="px-4 py-2 text-[14px] text-[#4C5F66]">
                            No registered barangays found.
                          </p>
                        )}

                      {!isBarangayLoading &&
                        !barangayError &&
                        barangayOptions.map((barangay) => (
                          <button
                            className="block w-full px-4 py-2 text-left text-[14px] text-[#1E1E1E] hover:bg-[#F4F2F0]"
                            key={barangay.id}
                            type="button"
                            onMouseDown={() => handleBarangaySelect(barangay)}
                          >
                            <span>{barangay.name}</span>
                            {barangay.city && (
                              <span className="text-[#A3A3A3] ml-1 text-[12px]">
                                — {barangay.city}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.barangayName?.message ?? errors.barangayId?.message}
                </p>

                {/* Sitio */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5">
                  <MapPinIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                  <select
                    className="outline-none max-w-full w-full min-w-0 bg-transparent disabled:text-[#A3A3A3]"
                    defaultValue=""
                    disabled={!selectedBarangay?.id || isSitioLoading}
                    {...register("sitioId")}
                    onChange={(e) => {
                      clearErrors("sitioId");
                      setSubmitError("");
                    }}
                  >
                    <option value="" disabled hidden>
                      {!selectedBarangay?.id
                        ? "Select barangay first"
                        : isSitioLoading
                          ? "Loading sitios..."
                          : "Select Sitio/Purok"}
                    </option>

                    {sitioOptions.map((sitio) => (
                      <option key={sitio.id} value={sitio.id}>
                        {sitio.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.sitioId?.name}
                </p>

                {/* Password */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5 justify-between">
                  <div className="flex flex-row gap-3 flex-1 min-w-0">
                    <LockClosedIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="outline-none w-full min-w-0 max-w-40 md:max-w-full"
                      {...register("password")}
                    />
                  </div>
                  <button
                    type="button"
                    className="hover:cursor-pointer shrink-0"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.password?.message}
                </p>

                {/* Confirm password */}
                <div className="flex flex-row gap-3.25 border-b border-[#E7E3E0] p-2.5 justify-between">
                  <div className="flex flex-row gap-3 flex-1 min-w-0">
                    <LockClosedIcon className="h-5.75 w-5.75 shrink-0 stroke-[#4C5F66]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="outline-none w-full min-w-0 max-w-40 md:max-w-full"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <button
                    type="button"
                    className="hover:cursor-pointer shrink-0"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.confirmPassword?.message}
                </p>

                {/* Terms */}
                <div className="ml-1 flex flex-row gap-3.25 p-2.25 justify-start items-center">
                  <input
                    type="checkbox"
                    className="h-4.25 w-4.25 shrink-0"
                    {...register("termsAccepted")}
                  />
                  <p
                    className="px-1 text-[13px] text-[#4C5F66]"
                    onClick={() => setIsTermsOpen(true)}
                  >
                    I accept{" "}
                    <span className="font-medium text-black">
                      Terms & conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-black">
                      Privacy policy.
                    </span>
                  </p>
                </div>
                <p className="text-[14px] text-red-500">
                  {errors.termsAccepted?.message}
                </p>

                {submitError && (
                  <p className="text-[14px] text-red-500">{submitError}</p>
                )}
                {/* error will go here */}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 justify-center items-center">
              <button
                className="bg-primary text-white font-medium py-3.75 px-20 rounded-[40px] max-w-63.75"
                type="submit"
              >
                Sign Up
              </button>

              <Link
                className="text-[14px] text-center text-[#4C5F66]"
                href="/login"
                onClick={() => {
                  sessionStorage.setItem("skipSplash", "true");
                }}
              >
                Already have an account?{" "}
                <span className="font-medium text-black">Log In</span>
              </Link>
            </div>
          </form>
        </div>
      </Page>
    </>
  );
}
