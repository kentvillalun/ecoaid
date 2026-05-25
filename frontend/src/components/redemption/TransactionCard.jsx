"use client";

import { formatDate } from "@/lib/formatDate";
import { Card } from "../ui/Card";
import { Error } from "../ui/Error";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

export const TransactionCard = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
  program = null,
}) => {

  const router = useRouter()

  return (
    <>
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Card
            className={`flex flex-col md:hidden items-start gap-3`}
            key={index}
          >
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col">
                <Skeleton width={105} />
                <div className="flex flex-row gap-1 items-center">
                  <Skeleton width={180} />
                </div>
                <Skeleton width={105} />
                <Skeleton width={100} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton width={120} />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
              <Skeleton width={105} />
              <Skeleton width={30} />
            </div>
          </Card>
        ))
      ) : isError ? (
        <div className="md:hidden">
          <Error handleRefetchCount={handleRefetchCount} />
        </div>
      ) : data?.transactions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-full p-10 gap-1 md:hidden">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#74C857]">
            EcoProfit
          </p>
          <h1 className="text-3xl font-semibold text-[#1F2937] text-center">
            No transactions yet
          </h1>
          <p className="text-sm text-[#6B7280] text-center">
            There are no redemption trasaction yet.
          </p>
        </div>
      ) : (
        data?.transactions?.map((d) => (
          <Card
            className={`flex flex-col md:hidden items-start gap-3 ${program ? program?.isActive : d?.program?.isActive ? "" : "opacity-60"}`}
            key={d?.id}
            handleClick={() => {
              router.push(`/redemption/transactions/${d?.id}`)
            }}
          >
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col w-full">
                <div className="flex flex-row items-center justify-between mb-1">
                  <h3 className="font-semibold">{d?.beneficiaryName}</h3>
                </div>
                <div className="flex flex-row gap-1 items-center">
                  {!program && (
                    <>
                      <p className="text-sm text-gray-500">
                        {d?.program?.name}
                      </p>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${d?.program?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {d?.program?.isActive ? "Active" : "Inactive"}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-400">By: {d?.collectorName}</p>
                <p className="text-sm text-gray-400 capitalize">
                  {(d?.educationalLevel).toLowerCase()} level
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {formatDate(d?.createdAt)}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {d?.redemptionTransactionItem?.length > 1
                  ? `${d?.redemptionTransactionItem?.length} materials`
                  : `${d?.redemptionTransactionItem?.length} material`}
              </p>
            </div>
          </Card>
        ))
      )}
    </>
  );
};
