import Skeleton from "react-loading-skeleton";
import { Card } from "../ui/Card";
import { Error } from "../ui/Error";
import { MaterialPill } from "../ui/MateriaPill";
import { formatDate } from "@/lib/formatDate";
import { useRouter } from "next/navigation";

export const RecentTransactionCard = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter();
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
                <Skeleton width={103} />
                <div className="flex flex-row gap-1 items-center">
                  <Skeleton width={105} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton width={120} />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
              <Skeleton width={130} />
              <Skeleton width={135} />
            </div>
          </Card>
        ))
      ) : isError ? (
        <div className="md:hidden">
          <Error handleRefetchCount={handleRefetchCount} />
        </div>
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-full p-20 gap-1 md:hidden">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#74C857]">
            EcoProfit
          </p>
          <h1 className="text-3xl font-semibold text-[#1F2937]">
            No transactions yet
          </h1>
          <p className="text-sm text-[#6B7280]">
            There are no redemption trasaction yet.
          </p>
        </div>
      ) : (
        data?.recentTransactions?.map((d) => (
          <Card
            className={`flex flex-col md:hidden items-start gap-3`}
            key={d?.id}
            handleClick={() =>
              router.push(`/collection-requests/${d?.requestId}`)
            }
          >
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col">
                <h3 className="font-semibold">
                  {d?.request?.user?.firstName} {d?.request?.user?.lastName}
                </h3>
                <div className="flex flex-row gap-1 items-center">
                  <p className="text-sm text-gray-500">Pickup Request</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <MaterialPill type={d?.request?.isAssorted === true ? "Assorted" : d?.request?.material?.category?.name} />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {formatDate(d?.request?.createdAt)}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Actual weight: {d?.actualWeight}{" "}
                <span className="capitalize">
                  {(d?.actualUnit).toLowerCase()}
                </span>
              </p>
            </div>
          </Card>
        ))
      )}
    </>
  );
};
