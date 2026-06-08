"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import Image from "next/image";
import {
  ListBulletIcon,
  BellIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProfilePage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const url = `/api/resident/me`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Logout failed");
        return;
      }

      sessionStorage.setItem("skipSplash", "true");
      localStorage.removeItem("ecoprofitResidentSession");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  return (
    <Page className="bg-new-bg!">
      <Toaster position="top-center" />
      <ResidentHeader
        title={"Profile"}
        className="py-6 shadow-none bg-new-bg!"
      />

      <PageContent className="pt-10 md:pl-3! md:top-18! ">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-4">
            <div className="border-5 rounded-full max-h-40 max-w-40 border-cta-color shadow-xl overflow-hidden flex items-center justify-center">
              <Image
                src={"/picture.jpg"}
                width={143}
                height={140}
                alt="Profile picture"
              />
            </div>
            {isLoading ? (
              <div className="text-center ">
                <Skeleton width={150} />
                <Skeleton width={250} />
              </div>
            ) : isError ? (
              <div className="text-center ">
                <div className="text-sm text-[#727272]">
                  Something went wrong.{" "}
                  <button
                    className="text-[#74C857] hover:underline"
                    onClick={handleRefetchCount}
                  >
                    Please try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center ">
                <p className="font-semibold text-lg">
                  {data?.user?.firstName} {data?.user?.lastName}
                </p>
                <p className="text-sm text-[#727272]">
                  Brgy. {data?.user?.barangay}, {data?.user?.municipality},{" "}
                  {data?.user?.province}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-14">
            <div className="flex flex-col gap-2">
              <Link href={"/profile/personal-information"}>
                <Card className="flex-row gap-5 shadow-none new-border">
                  <div className="min-w-10 min-h-10 rounded-full bg-[#9DB2CE26] flex items-center justify-center">
                    <ListBulletIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Personal Information</p>
                </Card>
              </Link>

              <Link href={"/profile/notifications"}>
                <Card className="flex-row gap-5 shadow-none new-border">
                  <div className="min-w-10 min-h-10 rounded-full bg-[#9DB2CE26] flex items-center justify-center">
                    <BellIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Notification Settings</p>
                </Card>
              </Link>

              <Link href={"/profile/settings"}>
                <Card className="flex-row gap-5 shadow-none new-border">
                  <div className="min-w-10 min-h-10 rounded-full bg-[#9DB2CE26] flex items-center justify-center">
                    <Cog8ToothIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Settings</p>
                </Card>
              </Link>

              <Link href={"/profile/help-support"}>
                <Card className="flex-row gap-5 shadow-none new-border">
                  <div className="min-w-10 min-h-10 rounded-full bg-[#9DB2CE26] flex items-center justify-center">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Help & Support</p>
                </Card>
              </Link>
            </div>

            <Card
              className="flex-row gap-5 shadow-none new-border mb-20"
              handleClick={handleLogout}
            >
              <div className="min-w-10 min-h-10 rounded-full bg-[#9DB2CE26] flex items-center justify-center">
                <ArrowLeftStartOnRectangleIcon className="w-6 h-6" />
              </div>
              <p className="font-medium ">Log out</p>
            </Card>
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
