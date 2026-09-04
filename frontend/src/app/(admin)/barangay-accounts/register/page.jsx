"use client";

import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { Card } from "@/components/ui/Card";
import { BarangayForm } from "@/components/admin/barangay-accounts/BarangayForm";
import { ArrowLeftIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterBarangayPage() {
  const { makeRequest } = useMutation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    toast.loading("Registration on progress");
    setIsLoading(true);
    const success = await makeRequest({
      url: "/api/admin/barangay/register",
      body: data,
    });

    if (success) {
      toast.dismiss();
      toast.success("Barangay registered successful");
      router.push("/barangay-accounts");
    } else {
      toast.dismiss();
      toast.error("Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Register Barangay" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header card */}

        <Card className="flex flex-row items-center gap-4 shadow-none! new-border">
          <Link
            href="/barangay-accounts"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
          </Link>

          <div className="flex flex-row gap-4 items-center flex-1">
            <div className="border p-3 border-gray-200 rounded-lg md:flex items-center hidden bg-white">
              <BuildingOffice2Icon className="w-6 stroke-admin-accent" />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="font-semibold text-xl">Register barangay</h2>
              <p className="text-sm text-gray-500">
                Add a new barangay to the platform
              </p>
            </div>
          </div>
        </Card>

        <BarangayForm
          defaultValues={{}}
          defaultModules={{}}
          onSubmit={onSubmit}
          submitLabel="Register barangay"
          isLoading={isLoading}
        />
      </PageContent>
    </Page>
  );
}
