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
import { ButtonSpinner } from "@/components/ui/buttonSpinner";
import imageCompression from "browser-image-compression";

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

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  const [categoryError, setCategoryError] = useState(null);
  const categoriesUrl = `/api/material/categories`;
  const [categoriesRefetchCount, setCategoriesRefetchCount] = useState(0);
  const { data: categoriesData } = useFetch({
    url: categoriesUrl,
    refetchCount: categoriesRefetchCount,
  });

  const materialUrl = category ? `/api/material?categoryId=${category}` : null;
  const [materialRefetchCount, setMaterialRefetchCount] = useState(0);
  const { data: materialData } = useFetch({
    url: materialUrl,
    refetchCount: materialRefetchCount,
  });
  const [isAssortedCheck, setIsAssortedCheck] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingMaterialName, setPendingMaterialName] = useState(null);
  const [isUnitLocked, setIsUnitLocked] = useState(false);
  const [isClassificationError, setIsClassificationError] = useState(false);
  const [compressedFile, setCompressedFile] = useState(null);

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

  const uploadToCloudinary = async (fileToUpload) => {
    if (cloudinaryUrl) return true;

    try {
      setIsLoading(true);
      toast.loading("Uploading photo...");
      const formData = new FormData();

      formData.append("file", fileToUpload);
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
      return data.secure_url;
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
      estimatedValue: 0,
      estimatedUnit: "",
      notes: "",
      materialId: null,
      isAssorted: false,
    },
  });

  const checkCategory = () => {
    if (!category || category === "") {
      setCategoryError("Material category is required");
    } else {
      setCategoryError(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const finalFile = compressedFile ?? (await compressImage());
      const uploadUrl = await uploadToCloudinary(finalFile);
      if (!uploadUrl) {
        return 
      }

      const response = await fetch(`${API_BASE_URL}/pickup-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          photoUrl: uploadUrl,
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
        toast.success("Request sent! Your barangay will review your request soon.")
        router.push('/home')
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

  const compressImage = async () => {
    const compressed = await imageCompression(imageFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    });
    setCompressedFile(compressed);
    return compressed;
  };

const analyzePhoto = async () => {
    try {
      alert("1: analyzePhoto Started");
      setIsAnalyzing(true);
      toast.loading("Analyzing photo");

      const compressedImageFile = await compressImage();
      alert("2: compression done");

      const file = await fileToBase64(compressedImageFile);
      alert("3: base64 done, length: " + file.length);

      const [header, base64Data] = file.split(",");
      const mimeType = header.split(":")[1].split(";")[0];
      alert("4: mimeType = " + mimeType);

      const response = await fetch(`/api/pickup-requests/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          image: base64Data,
          mimeType,
        }),
      });
      alert("5: fetch responded, status = " + response.status);

      if (!response.ok) {
        toast.dismiss();
        toast.error("There is a problem analyzing image");
        setIsClassificationError(true);
        return false;
      }
      const result = await response.json();
      alert("6: json parsed");

      setValue("isAssorted", result?.classification?.isAssorted);
      setIsAssortedCheck(result?.classification?.isAssorted);

      if (!result?.classification?.isAssorted) {
        const matchedCategory = categoriesData?.categories?.find(
          (c) => c.name === result?.classification?.materialCategory,
        );

        if (matchedCategory) {
          setCategory(matchedCategory?.id);
        }

        setPendingMaterialName(result?.classification?.material ?? null);
      }

      setValue("estimatedValue", result?.classification?.estimatedValue);
      setValue("notes", result?.classification?.notes);
      return true;
    } catch (error) {
      alert("Error: " + error.message);
      toast.dismiss();
      toast.error("There is a problem analyzing image");
      setIsClassificationError(true);
      return false;
    } finally {
      toast.dismiss();
      setIsAnalyzing(false);
    }
  };
  useEffect(() => {
    if (materialData && pendingMaterialName) {
      const matchedMaterial = materialData?.materials?.find(
        (m) => m.name === pendingMaterialName,
      );

      if (matchedMaterial) {
        setValue("materialId", matchedMaterial?.id);
        setValue("estimatedUnit", matchedMaterial.defaultUnit);
        setIsUnitLocked(matchedMaterial.defaultUnit === "PIECE");
      } else {
        toast.error(
          "Couldn't match the detected material, please select manually",
        );
        setIsUnitLocked(false);
      }
      setPendingMaterialName(null);
    }
  }, [materialData]);

  return (
    <Page className="bg-bg!">
      <Toaster position="top-center" />
      <ResidentHeader title={"Capture Recyclables"} />

     
      <section className="absolute left-0 right-0 top-18 h-[calc(100dvh-72px)] p-3 flex flex-col gap-6 overflow-y-auto  ">
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
            <div
              className={`flex flex-col items-center justify-center ${capturedImageUrl ? "h-auto" : "min-h-70"}`}
            >
              {capturedImageUrl ? (
                <div className="relative">
                  <img
                    src={capturedImageUrl}
                    alt="Captured recyclables"
                    className=""
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <ButtonSpinner />
                    </div>
                  )}
                </div>
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
            <div className="w-full flex flex-col gap-3">
              <div className="grid w-full gap-3 grid-cols-2 items-center justify-center">
                <button
                  className="text-gray-600 p-3 rounded-xl text-sm new-border min-w-27 bg-white"
                  onClick={() => {
                    setCloudinaryUrl(null);
                    openCamera();
                  }}
                >
                  Retake
                </button>
                <button
                  className="gradient-button text-white p-3 rounded-xl text-sm new-border min-w-27 disabled:opacity-50"
                  disabled={isAnalyzing}
                  onClick={async () => {
                    const finish = await analyzePhoto();
                    if (finish) {
                      setIsFormVisible(true);
                      setTimeout(() => {
                        document
                          .getElementById("form")
                          ?.scrollIntoView({ behavior: "smooth" });
                      });
                    }
                  }}
                >
                  Analyze Photo
                </button>
              </div>

              {imageFile && !isFormVisible && (
                <div className="text-sm flex flex-row items-center gap-1 justify-center">
                  <p className=" text-text-secondary text-center">
                    {isClassificationError
                      ? "Couldn't analyze this photo."
                      : "Prefer not to scan?"}
                  </p>
                  <button
                    className="text-accent font-medium"
                    onClick={() => setIsFormVisible(true)}
                  >
                    {isClassificationError
                      ? "Fill in manually instead"
                      : "Fill in manually"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid w-full max-w-md gap-3 grid-cols-1 items-center justify-center">
              <button
                className="gradient-button text-white p-3 rounded-xl text-sm shadow-md min-w-27"
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
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1 items-center justify-start text-sm flex-wrap">
                  <button
                    className={`py-1.5 px-3 rounded-full new-border ${!isAssortedCheck ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                    type="button"
                    onClick={() => {
                      setIsAssortedCheck(false);
                      setValue("isAssorted", false);
                    }}
                  >
                    Single material
                  </button>
                  <button
                    className={`py-1.5 px-3 rounded-full new-border ${isAssortedCheck ? "gradient-button text-white" : "bg-surface text-gray-600"} transition-all ease-in-out duration-200`}
                    type="button"
                    onClick={() => {
                      setIsAssortedCheck(true);
                      setValue("isAssorted", true);
                      setCategory("");
                      setValue("materialId", null);
                    }}
                  >
                    Mixed or assorted material
                  </button>
                </div>

                {isAssortedCheck && (
                  <p className="text-xs text-text-secondary text-start ">
                    <span className="font-medium">Note: </span>Collector will
                    identify materials during pickup
                  </p>
                )}
              </div>

              {!isAssortedCheck && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-base text-text-primary font-medium">
                      Material category
                    </label>
                    <div className="input text-base mb-0">
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
                    {categoryError && (
                      <p className="text-xs text-red-500 text-start">
                        {categoryError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-base text-text-primary">
                      Material
                    </label>
                    <div className="input text-base mb-0">
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
                      <p className="text-xs text-red-500 text-start">
                        {errors.materialId?.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-case text-text-primary ">
                    Estimated value
                  </label>
                  <input
                    type="number"
                    className="input mb-0"
                    placeholder="e.g. 1"
                    min={0}
                    {...register("estimatedValue")}
                  />
                  {errors.estimatedValue && (
                    <p className="text-xs text-red-500 text-start">
                      {errors.estimatedValue?.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-base text-text-primary ">
                    Unit
                  </label>
                  <div
                    className={`input text-base mb-0 ${isUnitLocked && "bg-gray-100"}`}
                  >
                    <select
                      className="w-full outline-none "
                      {...register("estimatedUnit")}
                      disabled={isUnitLocked}
                    >
                      <option value="" hidden disabled>
                        Choose unit
                      </option>
                      <option value="KG">kg</option>
                      <option value="GRAMS">grams</option>
                      <option value="LBS">lbs</option>
                      <option value="PIECE">piece/s</option>
                    </select>
                  </div>
                  {errors.estimatedUnit && (
                    <p className="text-xs text-red-500 text-start">
                      {errors.estimatedUnit?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-base text-text-primary ">
                  Purok
                </label>
                <input
                  value={sitio ?? "Loading..."}
                  disabled
                  type="text"
                  className="input mb-0 disabled:bg-gray-100"
                  placeholder="e.g. Sitio 1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-base text-text-primary">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  className="input mb-0 max-h-none"
                  placeholder="Enter your notes here"
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-xs text-red-500 text-start">
                    {errors.notes?.message}
                  </p>
                )}
              </div>
            </div>

            <button
              className="gradient-button text-white py-2.5 rounded-xl mb-10"
              type="submit"
              onClick={() => checkCategory()}
            >
              Submit Request
            </button>
          </form>
        )}
      </section>
    </Page>
  );
}
