"use client";

import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { CameraIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Page } from "@/components/layout/Page";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";

const schema = yup.object().shape({
  estimatedValue: yup
    .number("Please input numbers only")
    .required("Estimated value is requried")
    .positive("Please input positive numbers only"),
  estimatedUnit: yup
    .string()
    .oneOf(["KG", "GRAMS", "LBS", "PIECE"], "Invalid unit")
    .required("Unit is required"),
  notes: yup.string(),
  isAssorted: yup.boolean(),
  materialId: yup.string().when("isAssorted", {
    is: false,
    then: (m) => m.required("Material is required"),
    otherwise: (m) => m.nullable(),
  }),
});

export default function CapturePage() {
  const fileInputRef = useRef(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sitioLoading, setSitioLoading] = useState(false);
  const [sitio, setSitio] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [category, setCategory] = useState("");
  const categoriesUrl = `/api/material/categories`;
  const [categoriesRefetchCount, setCategoriesRefetchCount] = useState(0);
  const {
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    data: categoriesData,
  } = useFetch({ url: categoriesUrl, refetchCount: categoriesRefetchCount });

  const materialUrl = category ? `/api/material?categoryId=${category}` : null;
  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const { data: materialData } = useFetch({
    url: materialUrl,
    refetchCount: materialRefetchCount,
  });
  const [isAssortedCheck, setIsAssortedCheck] = useState(false);

  const openCamera = () => {
    fileInputRef.current.click();
  };

  const handleImageCapture = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    setImageFile(file); // store the actual file
    const url = URL.createObjectURL(file);
    setCapturedImageUrl(url); // store preview url

    event.target.value = "";
  };

  const uploadToCloudinary = async () => {
    if (cloudinaryUrl) return true;

    try {
      setIsLoading(true);
      toast.loading("Uploading photo...");
      const formData = new FormData();

      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError("Photo not uploaded");
        return;
      }

      toast.dismiss();
      toast.success("Photo uploaded!");
      setCloudinaryUrl(data.secure_url);
      return true;
    } catch (error) {
      setCloudinaryUrl(null);
      toast.dismiss();
      toast.error("There is a problem uploading photo");
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      estimatedValue: "",
      estimatedUnit: "",
      notes: "",
      materialId: null,
      isAssorted: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/pickup-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          photoUrl: cloudinaryUrl,
          materialId: data.isAssorted ? null : data.materialId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("There is a problem submitting request");
      }

      if (response.ok) {
        reset();
        setCapturedImageUrl(null);
        setCloudinaryUrl(null);
        setImageFile(null);
        setIsFormVisible(false);
        setIsSubmit(true);
      }
    } catch (error) {
      toast.error("There is a problem submitting request");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchdata = async () => {
      setSitioLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setSitio(result.user.sitio?.name);
      } catch (error) {
        setError(error.message);
      } finally {
        setSitioLoading(false);
      }
    };

    fetchdata();
  }, []);

  return (
    <Page>
      <Toaster position="top-center" />
      <ResidentHeader title={"Capture Recyclables"} />

      {isSubmit && (
        <section
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-100"
          onClick={() => {
            setIsSubmit(false);
            router.push("/home");
          }}
        >
          <div className="bg-white shadow-lg p-4 rounded-lg flex flex-col gap-4 items-center justify-center">
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircleIcon className="fill-[#74C857] h-10 w-10" />
              <p className="text-md font-medium">Request Sent!</p>
              <p className="text-sm text-[#727272] max-w-55 text-center">
                Your barangay will review your collection soon.
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="absolute left-0 right-0 top-18 h-[calc(100dvh-72px)] p-3 flex flex-col gap-6 overflow-y-auto pb-[calc(120px+env(safe-area-inset-bottom))]  ">
        <div className="flex flex-col items-center gap-3">
          {/* The hidden file input will go here */}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageCapture}
          />
          {/* The camera button */}
          <button
            type="button"
            className="w-full max-w-md overflow-hidden rounded-2xl border-6 border-dashed border-gray-200 text-center"
            onClick={openCamera}
          >
            <div className="flex min-h-70 flex-col items-center justify-center">
              {capturedImageUrl ? (
                <img
                  src={capturedImageUrl}
                  alt="Captured recyclables"
                  className=""
                />
              ) : (
                <div className="mx-6 my-8 flex flex-col items-center">
                  <CameraIcon className="h-25 fill-gray-200" />
                  <p className="font-medium text-gray-500 text-lg">
                    Capture your recyclables
                  </p>
                  <p className="text-gray-400">
                    Use your camera to take a photo for verification
                  </p>
                </div>
              )}
            </div>
          </button>

          {/* The open camera button */}
          {capturedImageUrl ? (
            <div className="grid w-full max-w-md gap-3 grid-cols-2 items-center justify-center">
              <button
                className="text-[#727272] p-3 rounded-lg text-sm shadow-md min-w-27 bg-white"
                onClick={() => {
                  setCloudinaryUrl(null);
                  openCamera();
                }}
              >
                Retake
              </button>
              <button
                className="bg-[#74C857] text-white p-3 rounded-lg text-sm shadow-md min-w-27 disabled:bg-[#5c9648]"
                disabled={isLoading}
                onClick={async () => {
                  const url = await uploadToCloudinary();
                  if (url) {
                    setIsFormVisible(true);
                    setTimeout(() => {
                      document
                        .getElementById("form")
                        ?.scrollIntoView({ behavior: "smooth" });
                    });
                  }
                }}
              >
                Next
              </button>
            </div>
          ) : (
            <div className="grid w-full max-w-md gap-3 grid-cols-1 items-center justify-center">
              <button
                className="bg-[#74C857] text-white p-3 rounded-lg text-sm shadow-md min-w-27"
                onClick={openCamera}
              >
                Open Camera
              </button>
            </div>
          )}
        </div>

        {isFormVisible && (
          <form
            className="flex flex-col gap-8"
            id="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-1 outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors min-h-11">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setIsAssortedCheck(e.target.checked);
                      setValue("isAssorted", e.target.checked);
                      if (e.target.checked) {
                        setCategory("");
                        setValue("materialId", null)
                      }
                    }}
                    id="mixed"
                  />
                  <label
                    className="font-medium text-base text-[#727272] px-2 flex-1"
                    htmlFor="mixed"
                  >
                    Mixed/ Assorted materials
                  </label>
                </div>
                {isAssortedCheck && (
                  <p className="text-[14px] text-[#727272] text-start italic ">
                    Collector will identify materials during pickup
                  </p>
                )}
              </div>

              {!isAssortedCheck && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-[#727272] px-2">
                      Material category
                    </label>
                    <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors">
                      <select
                        className="w-full outline-none"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                      >
                        <option value="" disabled hidden>
                          Choose a material category
                        </option>
                        {categoriesData?.categories.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-[#727272] px-2">
                      Material
                    </label>
                    <div className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors">
                      <select
                        className="w-full outline-none"
                        {...register("materialId")}
                      >
                        <option value="" disabled hidden>
                          Choose a material
                        </option>
                        {materialData?.materials.map((m) => (
                          <option value={m.id} key={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.materialId && (
                      <p className="text-[14px] text-red-500 text-center md:text-start">
                        {errors.materialId?.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-[#727272] px-2">
                  Estimated value
                </label>
                <div className="outline-1 py-2.5 pl-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors flex items-center justify-between">
                  <div className="flex flex-row justify-center items-center w-full pr-4">
                    <input
                      type="number"
                      className="outline-none w-full"
                      placeholder="e.g. 1"
                      {...register("estimatedValue")}
                    />
                    <select
                      className="outline-none"
                      {...register("estimatedUnit")}
                    >
                      <option value="" hidden disabled>
                        kg
                      </option>
                      <option value="KG">kg</option>
                      <option value="GRAMS">grams</option>
                      <option value="LBS">lbs</option>
                      <option value="PIECE">piece/s</option>
                    </select>
                  </div>
                </div>
                {errors.estimatedValue && (
                  <p className="text-[14px] text-red-500 text-center md:text-start">
                    {errors.estimatedValue?.message}
                  </p>
                )}
                {errors.estimatedUnit && (
                  <p className="text-[14px] text-red-500 text-center md:text-start">
                    {errors.estimatedUnit?.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-[#727272] px-2">
                  Purok / Sitio
                </label>
                <input
                  value={sitio ?? "Loading..."}
                  disabled
                  type="text"
                  className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors disabled:bg-gray-100"
                  placeholder="e.g. Sitio 1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-[#727272] px-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  className="outline-1 py-2.5 px-3.5 text-[#717680] outline-gray-300 rounded-lg focus-within:outline-[#74C857] transition-colors"
                  placeholder="Enter your notes here"
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-[14px] text-red-500 text-center md:text-start">
                    {errors.notes?.message}
                  </p>
                )}
              </div>
            </div>

            <button
              className="bg-[#74C857] text-white py-2.5 rounded-lg"
              type="submit"
            >
              Submit Request
            </button>
          </form>
        )}
      </section>
    </Page>
  );
}
