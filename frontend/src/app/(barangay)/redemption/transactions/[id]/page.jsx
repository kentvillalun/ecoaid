"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { Card } from "@/components/ui/Card";
import { DetailHeader } from "@/components/ui/DetailHeader";
import { LabelValue } from "@/components/ui/LabelValue";
import { MaterialPill } from "@/components/ui/MateriaPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useFetch } from "@/hooks/useFetch";
import { DocumentIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Error } from "@/components/ui/Error";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function TransactionDetailPage() {
  const [refetchCount, setRefetchCount] = useState(0);
  const { id } = useParams();
  const { data, isLoading, isError } = useFetch({
    url: `/api/redemption/transactions/${id}`,
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);

  return (
    <Page className="bg-new-bg!">
      <BarangayTopBar title={"Transaction Details"} />
      <PageContent className="md:pl-70! md:p-6 gap-3">
        <DetailHeader
          title={"Transaction Details"}
          subtitle={"Review full details of this redemption transaction"}
          icon={<DocumentIcon className="w-6 stroke-black" />}
          badgeLabel={
            data?.transaction?.program?.isActive ? "Active" : "Inactive"
          }
          badgeColor={
            data?.transaction?.program?.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        />

        <SectionHeader
          icon={<GiftIcon className="w-6 stroke-cta-color" />}
          title={"Transaction Details"}
          subtitle={"Review transaction information and redemption items"}
          noButton={true}
          className="mt-5"
        />

        <div className="grid grid-cols-1 gap-3">
          {isLoading ? (
            <>
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Transaction Information
                </h3>

                <div className="grid grid-cols-2 gap-4 w-full md:grid-cols-4">
                  <div className="flex flex-col">
                    <Skeleton width={75} />
                    <Skeleton width={80} />
                  </div>

                  <div className="flex flex-col">
                    <Skeleton width={75} />
                    <Skeleton width={150} />
                  </div>

                  <div className="flex flex-col">
                    <Skeleton width={75} />
                    <Skeleton width={150} />
                  </div>
                  <div className="flex flex-col">
                    <Skeleton width={120} />
                    <Skeleton width={150} />
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-sm text-gray-600 border-b border-gray-100 pb-2 min-w-full">
                  Redemption Items
                </h3>
                <div className="grid grid-cols-1 w-full gap-1">
                  <div className="text-sm text-gray-700 flex flex-row items-center justify-between pb-2 p-3">
                    <p className="">Material</p>

                    <p className="">Amount & value</p>
                  </div>

                  <div className="text-sm text-gray-600 flex flex-row items-center justify-between hover:bg-[#f8f8f8] transition-all p-3 rounded border-b border-gray-100">
                    <div className="flex flex-col md:flex-row gap-1 items-start">
                      <Skeleton width={100} />
                      <Skeleton width={90} />
                    </div>
                    <div className="flex flex-row gap-5">
                      <Skeleton width={20} />
                      <Skeleton width={20} />
                    </div>
                  </div>

                  <div className="p-3 text-sm text-gray-700 flex flex-row items-center justify-between">
                    <p className="">Total</p>
                    <Skeleton width={20} />
                  </div>
                </div>
              </Card>
            </>
          ) : isError ? (
            <div className=" flex items-center justify-center h-full">
              <Error handleRefetchCount={handleRefetchCount} />
            </div>
          ) : (
            <>
              <Card className="flex flex-col items-start gap-3 shadow-none! new-border">
                <h3 className="font-semibold text-xs md:text-sm text-gray-600 border-b border-gray-100 pb-2 w-full">
                  Transaction Information
                </h3>

                <div className="grid grid-cols-2 gap-4 w-full md:grid-cols-4">
                  <LabelValue
                    name={"Beneficiary"}
                    value={data?.transaction?.beneficiaryName}
                  />

                  <LabelValue
                    name={"Collector"}
                    value={data?.transaction?.collectorName}
                  />

                  <LabelValue
                    name={"Program"}
                    value={data?.transaction?.program?.name}
                  />

                  {data?.transaction?.educationalLevel && (
                    <LabelValue
                      name={"Educational Level"}
                      value={data?.transaction?.educationalLevel.toLowerCase()}
                      className="capitalize"
                    />
                  )}
                </div>
              </Card>

              <Card className="flex flex-col gap-3 shadow-none! new-border">
                <h3 className="font-semibold md:text-sm text-xs text-gray-600 border-b border-gray-100 pb-2 min-w-full">
                  Redemption Items
                </h3>
                <div className="grid grid-cols-1 w-full gap-1">
                  <div className="text-sm text-gray-700 flex flex-row items-center justify-between pb-2 p-3">
                    <p className="">Material</p>

                    <p className="">Amount & value</p>
                  </div>

                  {data?.transaction?.redemptionTransactionItem?.map((t) => (
                    <div
                      className="text-sm text-gray-600 flex flex-row items-center justify-between hover:bg-[#f8f8f8] transition-all p-3 rounded border-b border-gray-100"
                      key={t.id}
                    >
                      <div className="flex flex-col md:flex-row gap-1 items-start">
                        <p className="">{t?.programMaterial?.material?.name}</p>
                        <MaterialPill
                          type={t?.programMaterial?.material?.category?.name}
                          className="w-auto"
                        />
                      </div>
                      <div className="flex flex-row gap-5">
                        <p className="">
                          {t?.amount}{" "}
                          {t?.programMaterial?.material?.defaultUnit.toLowerCase()}
                        </p>
                        <p className="">
                          {data?.transaction?.program?.isCashMode
                            ? `₱ ${
                                t?.amount *
                                (data?.transaction?.program?.isCashMode
                                  ? t?.programMaterial?.cashValue
                                  : t?.programMaterial?.pointValue)
                              }`
                            : `${
                                t?.amount *
                                (data?.transaction?.program?.isCashMode
                                  ? t?.programMaterial?.cashValue
                                  : t?.programMaterial?.pointValue)
                              } pts`}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 text-sm text-gray-700 flex flex-row items-center justify-between">
                    <p className="">Total</p>
                    <p className="">
                      {data?.transaction?.program?.isCashMode && "₱"}{" "}
                      {data?.transaction?.redemptionTransactionItem?.reduce(
                        (sum, item) => sum + item.amount * item.currentValue,
                        0,
                      )}{" "}
                      {!data?.transaction?.program?.isCashMode && "pts"}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </PageContent>
    </Page>
  );
}
