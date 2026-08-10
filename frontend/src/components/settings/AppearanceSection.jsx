" use client"

import { THEMES, applyTheme } from "@/lib/themes";
import { useMutation } from "@/hooks/useMutation";
import { useState, useEffect, useRef } from "react";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { useFetch } from "@/hooks/useFetch";
import { SwatchIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";


export const AppearanceSection = () => {
  const themes = Object.entries(THEMES);
  const { makeRequest } = useMutation();
  const [themeRefetchCount, setThemeRefetchCount] = useState(0);
  const { data: barangayTheme } = useFetch({
    url: "/api/settings/theme/staff",
    refetchCount: themeRefetchCount,
  });
  const barangayThemeData = barangayTheme?.theme?.themeAccent ?? null;
  const [savedTheme, setSavedTheme] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);

  const handleThemeRefetchCount = () =>
    setThemeRefetchCount((prev) => prev + 1);

  const handleThemeSubmit = async () => {
    if (previewTheme === savedTheme)
      return toast.error("Please choose a new appearance");

    toast.loading("Saving new appearance");
    const success = await makeRequest({
      url: "/api/settings/theme",
      body: {
        themeAccent: previewTheme,
      },
      method: "PATCH",
    });

    if (success) {
      toast.dismiss();
      toast.success("New appearance saved");
      applyTheme(previewTheme);
      handleThemeRefetchCount();
    } else {
      toast.dismiss();
      toast.error("Failed to save new appearance. Please try again");
    }
  };

  const savedThemeRef = useRef(savedTheme);

  useEffect(() => {
    savedThemeRef.current = savedTheme;
  }, [savedTheme]);

  useEffect(() => {
    return () => {
      applyTheme(savedThemeRef.current);
    };
  }, []);

  useEffect(() => {
    if (!barangayThemeData) return;

    setSavedTheme(barangayThemeData);
    setPreviewTheme(barangayThemeData);
  }, [barangayThemeData]);
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title={"Appearance"}
        noButton
        subtitle={"Choose a color theme for yoour barangay"}
        icon={<SwatchIcon className="w-6 stroke-accent" />}
      />
      {previewTheme !== savedTheme && (
        <div className="flex flex-row items-center justify-start gap-2 p-4 bg-accent-light/20 rounded-2xl w-full">
          <ExclamationTriangleIcon className="min-w-6 max-w-6 stroke-accent" />
          <p className="text-xs text-accent">
            This theme will apply to{" "}
            <span className="font-semibold">all accounts</span> belonging to
            your barangay, including staff and residents. Changes take affect
            next time each person opens the app.{" "}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {themes.map(([key, theme]) => (
          <button
            className=""
            key={key}
            onClick={() => {
              setPreviewTheme(key);
              applyTheme(key);
            }}
          >
            <Card
              className="flex flex-col gap-1 p-3! "
              customBorder={
                key === previewTheme ? `1.5px solid ${theme.accent}` : ""
              }
            >
              <div className="w-full rounded-lg overflow-hidden new-border">
                <div
                  className={`w-full h-8 md:h-10`}
                  style={{ backgroundColor: theme.accentDark }}
                />
                <div className="p-2 md:p-4 flex flex-col gap-2">
                  <div
                    className="h-2 md:h-3 w-[65%] rounded-xl"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />
                  <div
                    className="h-2 md:h-3 w-[40%] rounded-xl"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />
                </div>

                <div
                  className="w-[50%] h-4 md:h-5 mx-2 mb-2 md:mx-4 md:mb-4 rounded-xl"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, ${theme.accentHover}, ${theme.accent})`,
                  }}
                />
              </div>
              <p className="text-sm text-start w-full ">{theme.name}</p>
            </Card>
          </button>
        ))}
      </div>
      {previewTheme !== savedTheme && (
        <div className="w-full flex items-end justify-end flex-row gap-2">
          <button
            className={`bg-white text-text-secondary new-border px-3.5 rounded-lg py-1.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer transition-all duration-200 ease-in-out text-nowrap text-sm new-border`}
            onClick={() => {
              setPreviewTheme(savedTheme);
              applyTheme(savedTheme);
            }}
          >
            Cancel
          </button>
          <button
            className={`gradient-button text-white new-border px-3.5 rounded-lg py-1.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer transition-all duration-200 ease-in-out text-nowrap text-sm `}
            onClick={() => handleThemeSubmit()}
          >
            Save changes
          </button>
        </div>
      )}
    </section>
  );
};
