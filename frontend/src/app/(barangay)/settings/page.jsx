"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import {
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { AddJunkshopModal } from "@/components/junkshop-sales/modals/AddJunkshopModal";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { applyTheme, THEMES } from "@/lib/themes";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";

const TABLE_HEADERS = ["Junkshop", "Location", "Status"];

export default function SettingsPage() {
  const [isAddJunkshopModalOpen, setIsAddJunkshopModalOpen] = useState(false);
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/junkshop-sales/junkshop",
    refetchCount,
  });
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

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);
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
    <Page className="bg-bg!">
      <BarangayTopBar title="Settings" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <BarangayHeaderCard
          title="Settings"
          subtitle="Manage your barangay's EcoAid configuration"
        />

        {/* Junkshops */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <SectionHeader
              title="Junkshops"
              subtitle="Manage junkshop partners and their price listings"
              icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
              buttonLabel="Add Junkshop"
              onAction={() => setIsAddJunkshopModalOpen(true)}
            />
            <p className="text-sm text-gray-600">
              To view junkshop details, go to the{" "}
              <Link
                href={"/junkshop-sales"}
                className="text-accent font-semibold"
              >
                Junkshop Sales
              </Link>{" "}
              page and press the junkshop name.
            </p>
          </div>

          {/* Desktop table */}
          <Card
            className={`hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="font-medium text-start p-4 text-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={3}>
                        <Spinner />
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={3}>
                        <Error
                          handleRefetchCount={handleRefetchCount}
                          subtext={
                            "Unable to get your junkshops. Please try again."
                          }
                        />
                      </td>
                    </tr>
                  ) : data?.junkshops?.length === 0 ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={3}>
                        <Empty
                          text={"No junkshops yet"}
                          subtext={
                            "No junkshop partners found. Press the add junkshop button above to add one."
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    data?.junkshops?.map((shop) => (
                      <tr
                        key={shop.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4 font-medium text-text-primary text-nowrap">
                          {shop.name}
                        </td>
                        <td className="p-4 text-nowrap">{shop.location}</td>
                        <td className="p-4">
                          <Badge
                            label={
                              shop.isAvailable ? "Available" : "Unavailable"
                            }
                            color={
                              shop.isAvailable
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <Skeleton width={150} />
                    <Skeleton width={70} />
                  </div>
                  <Skeleton width={180} />
                </Card>
              ))
            ) : isError ? (
              <Error
                handleRefetchCount={handleRefetchCount}
                subtext={"Unable to get your junkshops. Please try again."}
              />
            ) : data?.junkshops?.length === 0 ? (
              <Empty
                text={"No junkshops yet"}
                subtext={
                  "No junkshop partners found. Press the add junkshop button above to add one."
                }
              />
            ) : (
              data?.junkshops?.map((shop) => (
                <Card
                  key={shop.id}
                  className="flex flex-col items-start gap-2 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="text-sm font-semibold text-text-primary">
                      {shop.name}
                    </p>
                    <Badge
                      label={shop.isAvailable ? "Available" : "Unavailable"}
                      color={
                        shop.isAvailable
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{shop.location}</p>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Theme settings */}
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
                your barangay, including staff and residents. Changes take
                affect next time each person opens the app.{" "}
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

        <AddJunkshopModal
          isOpen={isAddJunkshopModalOpen}
          onClose={() => setIsAddJunkshopModalOpen(false)}
          setIsModalOpen={setIsAddJunkshopModalOpen}
          handleRefetchCount={handleRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
