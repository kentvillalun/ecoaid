"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { BarangayForm } from "@/components/admin/barangay-accounts/BarangayForm";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import { ArrowLeftIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function EditBarangayAccountPage() {
  const { id } = useParams();
  const router = useRouter();
  const { makeRequest } = useMutation();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [barangay, setBarangay] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setIsNotFound(false);

        const response = await fetch(`/api/admin/barangays/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          setIsError(true);
          return;
        }

        setBarangay(result?.barangay);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!id) return;

    fetchBarangay();
  }, [id, refetchCount]);

  const onSubmit = async (data) => {
    toast.loading("Saving changes");
    setIsSubmitting(true);
    const success = await makeRequest({
      url: `/api/admin/barangay/${id}`,
      method: "PATCH",
      body: data,
    });

    if (success) {
      toast.dismiss();
      toast.success("Barangay updated successful");
      router.push(`/barangay-accounts/${id}`);
    } else {
      toast.dismiss();
      toast.error("Update failed");
    }
    setIsSubmitting(false);
  };

  return (
    <Page className="bg-bg!">
      <AdminTopBar title="Edit Barangay" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        <Card className="flex flex-row items-center gap-4 shadow-none! new-border">
          <Link
            href={`/barangay-accounts/${id}`}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
          </Link>

          <div className="flex flex-row gap-4 items-center flex-1">
            <div className="border p-3 border-gray-200 rounded-lg md:flex items-center hidden bg-white">
              <BuildingOffice2Icon className="w-6 stroke-admin-accent" />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="font-semibold text-xl">Edit barangay</h2>
              <p className="text-sm text-gray-500">
                {barangay?.name
                  ? `Update details for Barangay ${barangay.name}`
                  : "Update barangay account details"}
              </p>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <Error handleRefetchCount={handleRefetchCount} />
          </div>
        ) : isNotFound ? (
          <div className="flex items-center justify-center h-full">
            <Error
              text="Barangay not found"
              subtext="This barangay may have been removed, or the link is incorrect."
              buttonLabel="Back to barangays"
              handleRefetchCount={() => router.push("/barangay-accounts")}
            />
          </div>
        ) : (
          <BarangayForm
            defaultValues={{
              name: barangay?.name,
              municipality: barangay?.municipality,
              province: barangay?.province,
              zipCode: barangay?.zipCode,
              contactNumber: barangay?.contactNumber,
              themeAccent: barangay?.themeAccent,
            }}
            defaultModules={{
              hasCollectionRequests: barangay?.hasCollectionRequests,
              hasRedemptionManagement: barangay?.hasRedemptionManagement,
              hasRewardInventory: barangay?.hasRewardInventory,
              hasLeaderboard: barangay?.hasLeaderboard,
            }}
            onSubmit={onSubmit}
            submitLabel="Save changes"
            isLoading={isSubmitting}
          />
        )}
      </PageContent>
    </Page>
  );
}
