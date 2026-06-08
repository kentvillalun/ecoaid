import { Inter } from "next/font/google";
import { StatusBadge } from "../ui/StatusBadge";
import { PendingActions } from "./actions/PendingActions";
import { ApprovedActions } from "./actions/ApprovedActions";
import { Card } from "../ui/Card";
import { InProgressActions } from "./actions/InProgressActions";
import { formatDate } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/Spinner";
import { Empty } from "../ui/Empty";
import { Error } from "../ui/Error";
import { MaterialTag } from "../ui/MaterialTag";
import { p } from "motion/react-client";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const RequestTable = ({
  data,
  status,
  selectedIds = [],
  onToggleSelect,
  handleBatchCollection,
  handleRefetchCount,
  isLoading,
  isError,
  categories,
}) => {
  const router = useRouter();

  const tableConfig = {
    ALL: [
      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Materials",
        render: (data) => (
          <div className="flex  items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },
      {
        header: "Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}
          </p>
        ),
      },
      {
        header: "Status",
        render: (data) => <StatusBadge type={data.status} />,
      },
      {
        header: "Date Requested",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.createdAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start flex-row gap-3">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => {
                router.push(`/collection-requests/${data.id}`);
              }}
            >
              {data?.status !== "REQUESTED" &&
              data?.status !== "APPROVED" &&
              data?.status !== "IN_PROGRESS"
                ? "View Details"
                : "View"}
            </button>
            {data.status === "REQUESTED" ? (
              <PendingActions
                id={data.id}
                onSuccess={() => handleRefetchCount()}
              />
            ) : data.status === "APPROVED" ? (
              <ApprovedActions
                id={data.id}
                onSuccess={() => handleRefetchCount()}
              />
            ) : data.status === "IN_PROGRESS" ? (
              <InProgressActions
                id={data.id}
                isAssorted={data.isAssorted}
                material={data?.material}
                onSuccess={() => handleRefetchCount()}
                categories={categories}
              />
            ) : (
              <></>
            )}
          </div>
        ),
      },
    ],
    REQUESTED: [
      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Materials",
        render: (data) => (
          <div className="flex items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },
      {
        header: "Estimated Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}
          </p>
        ),
      },
      {
        header: "Date Requested",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.createdAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start flex-row gap-3">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => {
                router.push(`/collection-requests/${data.id}`);
              }}
            >
              View
            </button>
            <PendingActions
              id={data.id}
              onSuccess={() => handleRefetchCount()}
            />
          </div>
        ),
      },
    ],
    APPROVED: [
      {
        header: "Select",
        render: (data) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(data.id)}
            onChange={() => onToggleSelect?.(data.id)}
          />
        ),
      },

      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Materials",
        render: (data) => (
          <div className="flex items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },
      {
        header: "Estimated Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}
          </p>
        ),
      },
      {
        header: "Pickup Schedule",
        render: (data) => (
          <StatusBadge
            type={data.isScheduled ? "SCHEDULED" : "NOT_SCHEDULED"}
          />
        ),
      },
      {
        header: "Date Approved",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.approvedAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start flex-row gap-3">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => router.push(`/collection-requests/${data.id}`)}
            >
              View
            </button>
            <ApprovedActions
              id={data.id}
              onSuccess={() => handleRefetchCount()}
            />
          </div>
        ),
      },
    ],
    IN_PROGRESS: [
      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Materials",
        render: (data) => (
          <div className="flex items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },

      {
        header: "Estimated Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}
          </p>
        ),
      },
      {
        header: "Pickup Schedule",
        render: (data) => (
          <StatusBadge
            type={data.isScheduled ? "SCHEDULED" : "NOT_SCHEDULED"}
          />
        ),
      },
      {
        header: "Date Approved",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.approvedAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start flex-row gap-3">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => router.push(`/collection-requests/${data.id}`)}
            >
              View
            </button>
            <InProgressActions
              id={data.id}
              isAssorted={data.isAssorted}
              material={data?.material}
              onSuccess={() => handleRefetchCount()}
              categories={categories}
            />
          </div>
        ),
      },
    ],
    COLLECTED: [
      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Materials",
        render: (data) => (
          <div className="flex items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },

      {
        header: "Estimated Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}
          </p>
        ),
      },
      {
        header: "Date Collected",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.collectedAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => router.push(`/collection-requests/${data.id}`)}
            >
              View Details
            </button>
          </div>
        ),
      },
    ],
    REJECTED: [
      {
        header: "Household",
        render: (data) => (
          <p className="font-semibold text-text-primary">
            {data.user.firstName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.phoneNumber}
          </p>
        ),
      },
      {
        header: "Sitio",
        render: (data) => (
          <p className="text-gray-600">{data.user.sitio.name}</p>
        ),
      },
      {
        header: "Material Name",
        render: (data) => (
          <div className="flex items-center">
            {data?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.material?.name}
                type={data?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
        ),
      },

      {
        header: "Est. Value",
        render: (data) => (
          <p className="text-gray-600">
            {`${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit.toLowerCase()}`}{" "}
          </p>
        ),
      },
      {
        header: "Rejection Reason",
        render: (data) => (
          <p className="text-gray-600">{data.rejectionReason}</p>
        ),
      },
      {
        header: "Date Rejected",
        render: (data) => (
          <p className="text-gray-600">{formatDate(data.rejectedAt)}</p>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-start">
            <button
              className="text-gray-600 hover:underline"
              onClick={() => router.push(`/collection-requests/${data.id}`)}
            >
              View Details
            </button>
          </div>
        ),
      },
    ],
  };

  const columns = tableConfig[status];

  const filteredRequest =
    status === "ALL" ? data : data?.filter((req) => req.status === status);

  return (
    <Card
      className={`${inter.className} hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead className="border-b border-[#E6EFF5]">
          <tr className="">
            {columns?.map((col) => (
              <th
                className="font-medium p-4 text-start text-gray-500"
                key={col.header}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={9}>
                <Spinner />
              </td>
            </tr>
          )}
          {isError && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={9}>
                <Error handleRefetchCount={handleRefetchCount} />
              </td>
            </tr>
          )}
          {filteredRequest?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={9}>
                <Empty
                  text={"No items"}
                  subtext={
                    "There are no item in this tab yet. Please go to the Pending tab to update status of pickup requests"
                  }
                />
              </td>
            </tr>
          ) : (
            filteredRequest?.map((req) => (
              <tr
                className={`text-start hover:bg-[#f8f8f8] transition-all transform ${isLoading && "hidden"}`}
                key={req.id}
              >
                {columns?.map((col) => (
                  <td key={col.header} className="p-4">
                    {col.render(req)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
};
