"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { TransactionCard } from "@/components/redemption/TransactionCard";
import { TransactionTable } from "@/components/redemption/TransactionTable";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { LabelValue } from "@/components/ui/LabelValue";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GiftIcon, Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AddProgramModal } from "@/components/redemption/modals/AddProgramModal";
import { useFetch } from "@/hooks/useFetch";
import { MaterialPill } from "@/components/ui/MateriaPill";
import { RecordTransactionModal } from "@/components/redemption/modals/RecordTransactionModal";
import { Error } from "@/components/ui/Error";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/ui/Empty";

export default function RedemptionProgramPage() {
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const url = "/api/redemption/programs";
  const [refetchCount, setRefetchCount] = useState(0);
  const [transactionRefetchCount, setTransactionRefetchCount] = useState(0);
  const { data, isError, isLoading } = useFetch({ url, refetchCount });
  const router = useRouter();

  const transactionUrl = "/api/redemption/transactions";
  const {
    data: transactionData,
    isLoading: transactionIsLoading,
    isError: transactionIsError,
  } = useFetch({
    url: transactionUrl,
    refetchCount: transactionRefetchCount,
  });

  const { data: currentBarangayData } = useFetch({
    url: "/api/auth/barangay/me",
  });

  const handleTransactionRefetch = () =>
    setTransactionRefetchCount((prev) => prev + 1);
  const handleProgramRefetch = () => setRefetchCount((prev) => prev + 1);

  return (
    <Page>
      <BarangayTopBar title={"Redemption Management"} />
      <PageContent className="bg-[#F3F3FF]! md:pl-80 md:p-6 md:gap-7">
        <BarangayHeaderCard
          title={"Redemption Management"}
          subtitle={"Create and manage redemption programs and transactions"}
        />

        {/* Add Program modal */}
        {isProgramModalOpen &&
          createPortal(
            <AddProgramModal
              isProgramModalOpen={isProgramModalOpen}
              setIsProgramModalOpen={setIsProgramModalOpen}
              setRefetchCount={setRefetchCount}
            />,
            document.body,
          )}

        {/* Add Transaction modal */}
        {isTransactionModalOpen &&
          createPortal(
            <RecordTransactionModal
              isTransactionModalOpen={isTransactionModalOpen}
              setIsTransactionModalOpen={setIsTransactionModalOpen}
              setTransactionRefetchCount={setTransactionRefetchCount}
              data={data.programs}
              currentBarangayData={currentBarangayData}
            />,
            document.body,
          )}

        <section className="flex flex-col gap-3">
          <SectionHeader
            title={"Programs"}
            subtitle={"Active redemption programs"}
            icon={<GiftIcon className="w-6 stroke-black" />}
            buttonLabel={"Add Program"}
            onAction={() => setIsProgramModalOpen(true)}
          />
          <div
            className={`grid gap-3 ${data?.programs.length === 1 && "grid-cols-1"} ${data?.programs.length === 2 && "md:grid-cols-2"} ${data?.programs.length >= 3 && "md:grid-cols-3"}`}
          >
            {isLoading ? (
              <Spinner className="p-7!" />
            ) : isError ? (
              <Error handleRefetchCount={handleProgramRefetch} />
            ) : data?.programs?.length === 0 ? (
              <Empty
                text={"No redemption programs yet"}
                subtext={
                  "Please register a new redemption program by tapping the Add Program button above."
                }
              />
            ) : (
              data?.programs.map((p) => (
                <Card
                  className={`flex flex-col gap-2 p-5! hover:-translate-y-0.5 transition-all duration-200 ease-in-out hover:cursor-pointer ${data?.programs?.length === 1 ? "items-center" : "items-start"}`}
                  key={p.id}
                  handleClick={() =>
                    router.push(`/redemption-programs/${p.id}`)
                  }
                >
                  <div
                    className={`flex flex-row items-center  w-full ${data?.programs?.length === 1 ? "justify-center gap-2" : "justify-between"}`}
                  >
                    <h4 className="text-base font-semibold">{p.name}</h4>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-row gap-6">
                    <LabelValue
                      name="Budget"
                      value={`₱ ${p.allotedBudget.toLocaleString()}`}
                    />
                    {!p.isCashMode && (
                      <LabelValue
                        name="Max Points"
                        value={`${p.maxPoints} pts`}
                      />
                    )}
                    <LabelValue
                      name="Redemption Mode"
                      value={p.isCashMode ? "Cash" : "Point"}
                    />
                  </div>

                  <div
                    className={`flex flex-row flex-wrap gap-1 pt-3 border-t border-gray-100 w-full ${data?.programs?.length === 1 ? "items-center justify-center" : ""}`}
                  >
                    {p.programMaterial.map((m) => (
                      <MaterialPill
                        className="w-auto!"
                        type={m?.material?.category?.name}
                        materialName={m?.material?.name}
                        points={p?.isCashMode ? `₱${m.cashValue}` : `${m.pointValue} pts`}
                        key={m.id}
                      />
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            title={"Transaction history"}
            subtitle={"All recorded redemptions"}
            icon={<Bars3BottomLeftIcon className="w-6 stroke-black" />}
            buttonLabel={"Record transaction"}
            onAction={() => setIsTransactionModalOpen(true)}
          />
          <TransactionTable
            data={transactionData}
            isLoading={transactionIsLoading}
            isError={transactionIsError}
            handleRefetchCount={handleTransactionRefetch}
          />
          <TransactionCard
            data={transactionData}
            isLoading={transactionIsLoading}
            isError={transactionIsError}
            handleRefetchCount={handleTransactionRefetch}
          />
        </section>
      </PageContent>
    </Page>
  );
}
