"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { Card } from "@/components/ui/Card";
import { LabelValue } from "@/components/ui/LabelValue";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  GiftIcon,
  Bars3BottomLeftIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { formatDate } from "@/lib/formatDate";
import { useState } from "react";
import { DetailHeader } from "@/components/ui/DetailHeader";
import { useParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { TransactionCard } from "@/components/redemption/TransactionCard";
import { createPortal } from "react-dom";
import { RecordTransactionModal } from "@/components/redemption/modals/RecordTransactionModal";
import { AddProgramModal } from "@/components/redemption/modals/AddProgramModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

const TABLE_COLUMNS = [
  {
    header: "Beneficiary",
    render: (t) => (
      <div className="flex flex-col items-start">
        <p className="font-semibold">{t?.beneficiaryName}</p>
        <p className="text-gray-500 capitalize">
          {t?.educationalLevel.toLowerCase()} level
        </p>
        <p className="text-gray-500 capitalize">
          Collected By: {t?.collectorName}
        </p>
      </div>
    ),
  },
  {
    header: "Material",
    render: (t) => (
      <div className="flex justify-center">
        {t?.redemptionTransactionItem?.length > 1
          ? `${t?.redemptionTransactionItem?.length} materials`
          : `${t?.redemptionTransactionItem?.length} material`}
      </div>
    ),
  },
  {
    header: "Values",
    render: (t, isCashMode) => (
      <span className="">
        {isCashMode
          ? `₱ ${t?.redemptionTransactionItem?.reduce((sum, item) => sum + item.amount * item.currentValue, 0)}`
          : `${t?.redemptionTransactionItem?.reduce((sum, item) => sum + item.amount * item.currentValue, 0)} pts `}
      </span>
    ),
  },
  {
    header: "Date",
    render: (t) => formatDate(t?.createdAt),
  },
  {
    header: "Action",
    render: (t, isCashMode, router) => (
      <div className="flex items-center justify-center">
        <button
          className="text-gray-600 hover:underline hover:cursor-pointer"
          onClick={() => router.push(`/redemption/transactions/${t.id}`)}
        >
          View Details
        </button>
      </div>
    ),
  },
];

export default function ProgramDetails() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refetchCount, setRefetchCount] = useState(0);
  const { id } = useParams();
  const url = `/api/redemption/programs/${id}`;
  const { isLoading, isError, data } = useFetch({ url, refetchCount });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);
  const transactions = data?.program?.redemptionTransaction;

  const { data: currentBarangayData } = useFetch({
    url: "/api/auth/barangay/me",
  });
  const router = useRouter();
  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title={"Program Details"} />
      <PageContent className="md:pl-70! md:p-6 gap-3">
        {isTransactionModalOpen &&
          createPortal(
            <RecordTransactionModal
              isTransactionModalOpen={isTransactionModalOpen}
              setIsTransactionModalOpen={setIsTransactionModalOpen}
              setTransactionRefetchCount={setRefetchCount}
              preselectedProgram={data?.program}
              currentBarangayData={currentBarangayData}
            />,
            document.body,
          )}

        {isEditModalOpen &&
          createPortal(
            <AddProgramModal
              isProgramModalOpen={isEditModalOpen}
              setIsProgramModalOpen={setIsEditModalOpen}
              setRefetchCount={setRefetchCount}
              program={data?.program}
              id={id}
            />,
            document.body,
          )}

        <DetailHeader
          title={"Program Details"}
          subtitle={"Review the full details of this redemption program"}
          badgeLabel={data?.program?.isActive ? "Active" : "Inactive"}
          badgeColor={
            data?.program?.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
          icon={<DocumentIcon className="w-6 stroke-black" />}
        />

        <SectionHeader
          icon={<GiftIcon className="w-6 stroke-cta-color" />}
          title={"Program Details"}
          subtitle={"Review program details and material points"}
          buttonLabel={"Edit Program"}
          buttonIcon={<PencilSquareIcon className="w-5 hidden md:flex" />}
          onAction={() => setIsEditModalOpen(true)}
          className="mt-5"
        />

        <div className="grid grid-cols-1 gap-3">
          {/* Section 1 — Program Information */}
          {isLoading ? (
            <>
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Program Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col">
                    <Skeleton width={102} />
                    <Skeleton width={160} />
                  </div>
                  <div className="flex flex-col">
                    <Skeleton width={46} />
                    <Skeleton width={53} />
                  </div>
                  <div className="flex flex-col">
                    <Skeleton width={106} />
                    <Skeleton width={85} />
                  </div>

                  <div className="flex flex-col">
                    <Skeleton width={80} />
                    <Skeleton width={300} />
                  </div>

                  <div className="flex flex-col">
                    <Skeleton width={123} />
                    <Skeleton width={46} />
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Material Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
                  <div className="flex flex-row items-center justify-between py-2.5 border-b border-gray-50 last:border-0 md:odd:border-r md:odd:pr-4 md:even:pl-4">
                    <Skeleton width={130} />
                    <div className="flex flex-col items-end">
                      <Skeleton width={46} />
                      <Skeleton width={46} />
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : isError ? (
            <div className="flex items-center justify-center h-full">
              <Error handleRefetchCount={handleRefetchCount} />
            </div>
          ) : (
            <>
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Program Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <LabelValue name="Program Name" value={data?.program.name} />
                  <LabelValue
                    name="Status"
                    value={data?.program?.isActive ? "Active" : "Inactive"}
                  />
                  <LabelValue
                    name="Allotted Budget"
                    value={`₱ ${data?.program?.allotedBudget.toLocaleString()}`}
                  />

                  <LabelValue
                    name="Redemption Mode"
                    value={data?.program?.isCashMode ? "Cash" : "Point"}
                  />
                </div>
                <LabelValue
                  name="Description"
                  value={
                    data?.program?.description === null
                      ? "There is no description available"
                      : data?.program?.description
                  }
                  className="w-full"
                />
              </Card>

              {/* Section 2 — Material Points */}
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Material Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
                  {data?.program?.programMaterial.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex flex-row items-center justify-between py-2.5 border-b border-gray-50 last:border-0 md:odd:border-r md:odd:pr-4 md:even:pl-4"
                    >
                      <MaterialTag
                        type={m?.material?.category?.name}
                        materialName={m?.material?.name}
                        textOnly={true}
                      
                      />
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-semibold text-gray-700">
                          {data?.program?.isCashMode
                            ? `₱${m?.cashValue}`
                            : `${m?.pointValue} pts`}
                        </p>
                        <p className="text-xs text-gray-400">
                          per {m?.material?.defaultUnit?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Section 3 — Transaction History */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              title={"Transaction History"}
              subtitle={"Redemption transactions under this program"}
              icon={<Bars3BottomLeftIcon className="w-6 stroke-cta-color" />}
              buttonLabel={"Record Transaction"}
              onAction={() => setIsTransactionModalOpen(true)}
              buttonClassName={data?.program?.isActive ? "flex!" : "hidden!"}
            />

            {/* Desktop: table */}
            <Card
              className={` hidden md:flex md:flex-col px-8 overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
            >
              <table className="w-full text-sm border-collapse text-nowrap">
                <thead className="border-b border-[#E6EFF5]">
                  <tr>
                    {TABLE_COLUMNS.map((col) => (
                      <th
                        className="font-medium text-base p-4"
                        key={col.header}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={9}>
                        <Spinner />
                      </td>
                    </tr>
                  )}
                  {isError && (
                    <tr className="max-w-md ">
                      <td className="text-center" colSpan={9}>
                        <Error handleRefetchCount={handleRefetchCount} />
                      </td>
                    </tr>
                  )}
                  {transactions?.length === 0 ? (
                    <tr className="max-w-md">
                      <td className="text-center" colSpan={9}>
                        <Empty
                          text={"No transaction yet"}
                          subtext={
                            "There are no transactions under this program yet"
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    transactions?.map((t) => (
                      <tr
                        key={t?.id}
                        className="text-center hover:bg-[#f8f8f8] transition-all"
                      >
                        {TABLE_COLUMNS.map((col) => (
                          <td key={col.header} className="p-3">
                            {col.render(t, data?.program?.isCashMode, router)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>

            {isLoading ? (
              <SkeletonCard rowsCount={2} />
            ) : isError ? (
              <div className=" flex items-center justify-center h-full md:hidden">
                <Error handleRefetchCount={handleRefetchCount} />
              </div>
            ) : (
              <TransactionCard
                data={{ transactions }}
                program={data?.program}
              />
            )}
          </section>
        </div>
      </PageContent>
    </Page>
  );
}
