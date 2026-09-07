"use client";

import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Error } from "@/components/ui/Error";
import { useRouter } from "next/navigation";

const getMissingItems = (barangay) => {
  const items = [...barangay.missingRoles];
  if (barangay.sitioCount === 0) items.push("No sitios added yet");
  return items.join(", ");
};

export const IncompleteSetupCard = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter();

  return (
    <div className="flex md:hidden flex-col gap-2">
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Error
          handleRefetchCount={handleRefetchCount}
          subtext="Unable to load onboarding status. Please try again."
        />
      ) : data?.length === 0 ? (
        <Empty
          text="All caught up"
          subtext="Every registered barangay has its required staff roles and sitios."
        />
      ) : (
        data?.map((barangay) => (
          <Card
            key={barangay.id}
            handleClick={() => router.push(`/barangay-accounts/${barangay.id}`)}
            className="flex flex-col items-start gap-1 shadow-none! rounded-xl! transition-all new-border hover:cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] duration-200 ease-in-out"
          >
            <h3 className="font-semibold text-sm text-text-primary">
              Barangay {barangay.name}
            </h3>
            <p className="text-xs text-gray-500">{getMissingItems(barangay)}</p>
          </Card>
        ))
      )}
    </div>
  );
};
