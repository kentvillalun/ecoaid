"use client";

import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { useRouter } from "next/navigation";

const TABLE_HEADERS = ["Barangay", "Missing Items", "Action"];

const getMissingItems = (barangay) => {
  const items = [...barangay.missingRoles];
  if (barangay.sitioCount === 0) items.push("No sitios added yet");
  return items.join(", ");
};

export const IncompleteSetupTable = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter();

  return (
    <Card className="hidden md:flex md:flex-col new-border px-8 overflow-x-auto md:gap-3 md:items-start shadow-none! rounded-xl!">
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead style={{ borderBottom: "0.5px solid #e5e7eb" }}>
          <tr>
            {TABLE_HEADERS.map((h) => (
              <th key={h} className="font-medium p-4 text-start text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Spinner className="pt-10!"/>
              </td>
            </tr>
          )}
          {isError && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Error
                className="pt-10!"
                  handleRefetchCount={handleRefetchCount}
                  subtext="Unable to load onboarding status. Please try again."
                />
              </td>
            </tr>
          )}
          {!isLoading && !isError && data?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Empty
                className="pt-10!"
                  text="All caught up"
                  subtext="Every registered barangay has its required staff roles and sitios."
                />
              </td>
            </tr>
          ) : (
            !isLoading &&
            !isError &&
            data?.map((barangay) => (
              <tr
                key={barangay.id}
                className="text-start hover:bg-bg hover:cursor-pointer transition-all transform"
                onClick={() => router.push(`/barangay-accounts/${barangay.id}`)}
              >
                <td className="p-4">
                  <p className="font-semibold text-text-primary">
                    Barangay {barangay.name}
                  </p>
                </td>
                <td className="p-4 text-gray-600">{getMissingItems(barangay)}</td>
                <td className="p-4">
                  <button
                    className="text-text-secondary text-sm hover:underline hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/barangay-accounts/${barangay.id}`);
                    }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
};
