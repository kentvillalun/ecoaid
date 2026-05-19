import { Card } from "../ui/Card";
import { useRouter } from "next/navigation";
import { Pill } from "../ui/Pill";
import { MaterialPill } from "../ui/MateriaPill";
import { formatDate } from "@/lib/formatDate";
import { SkeletonCard } from "../ui/SkeletonCard";
import { Error } from "../ui/Error";
import { Empty } from "../ui/Empty";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const RequestCard = ({
  data,
  status,
  selectedIds = [],
  onToggleSelect,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const filteredRequest = data?.filter((req) => req.status === status);
  const router = useRouter();

  if (isLoading)
    return (
      Array.from({ length: 3}).map((_, index) => (
        <Card
          className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out
        }`}
          key={index}
        >
          {/* Top row */}
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col gap-0.5">
              <Skeleton width={120} />
              <Skeleton width={40} />
              <Skeleton width={170} />
              <Skeleton width={190} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton width={120} />
              <Skeleton width={120} />
            </div>
          </div>

          {/* Footer row */}
          <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
            <Skeleton width={130} />
          </div>
        </Card>
      ))
    )
        
     

  if (isError) return <Error handleRefetchCount={handleRefetchCount} />;

  return (
    <>
      {filteredRequest?.length === 0 ? (
        <Empty
          text={"No items"}
          subtext={
            "There are no item in this tab yet. Please go to the Pending tab to update status of pickup requests"
          }
        />
      ) : (
        filteredRequest?.map((d) => {
          const isApproved = status === "APPROVED";
          const isSelected = selectedIds.includes(d.id);

          return (
            <label
              key={d.id}
              className={`block ${isApproved ? "cursor-pointer" : ""}`}
            >
              {isApproved && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect?.(d.id)}
                  className="sr-only"
                />
              )}
              {d.status === "APPROVED" ? (
                <Card
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out ${
                    isSelected ? "bg-[#F0FAF0] ring-2 ring-[#74C857]" : ""
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-[#1F2937]">
                        {d.user.firstName
                          ? `${d.user.firstName} ${d.user.lastName}`
                          : d?.user.phoneNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {d.user.sitio.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {d?.isAssorted === true ? "Assorted" : d?.material?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Estimated value:{" "}
                        <span className="font-medium text-gray-600">
                          {d.estimatedValue} {d.estimatedUnit === "PIECE" ? "pcs" : d.estimatedUnit}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Pill type={d.status} />
                      <MaterialPill type={d.material?.category?.name ?? "Assorted"} />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {formatDate(d.createdAt)}
                    </p>
                    <button
                      className="text-sm text-[#74C857] pr-5 font-medium"
                      onClick={() =>
                        router.push(`/collection-requests/${d.id}`)
                      }
                    >
                      View Details
                    </button>
                  </div>
                </Card>
              ) : (
                <Card
                  className={`flex flex-col items-start gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out ${
                    isSelected ? "bg-[#F0FAF0] ring-2 ring-[#74C857]" : ""
                  }`}
                  handleClick={() =>
                    router.push(`/collection-requests/${d.id}`)
                  }
                >
                  {/* Top row */}
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-[#1F2937]">
                        {d.user.firstName
                          ? `${d.user.firstName} ${d.user.lastName}`
                          : d?.user.phoneNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {d.user.sitio.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {d?.isAssorted === true ? "Assorted" : d?.material?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Estimated value:{" "}
                        <span className="font-medium text-gray-600">
                          {d.estimatedValue} {d.estimatedUnit === "PIECE" ? "pcs" : d.estimatedUnit}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Pill type={d.status} />
                      <MaterialPill type={d.isAssorted === true ? "Assorted" : d.material?.category?.name} />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {formatDate(d.createdAt)}
                    </p>
                  </div>
                </Card>
              )}
            </label>
          );
        })
      )}
    </>
  );
};
