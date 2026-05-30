import { Inter } from "next/font/google";
import { Pill } from "../ui/Pill";
import { PendingActions } from "./actions/PendingActions";
import { ApprovedActions } from "./actions/ApprovedActions";
import { Card } from "../ui/Card";
import { InProgressActions } from "./actions/InProgressActions";
import { formatDate } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/Spinner";
import { Empty } from "../ui/Empty";
import { Error } from "../ui/Error";


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
  categories
}) => {

  const router = useRouter()
  console.log(categories)
  

  const tableConfig = {
    REQUESTED: [
      { header: "Date Requested", render: (data) => formatDate(data.createdAt) },
      {
        header: "Household",
        render: (data) =>
          data.user.firstName
            ? `${data.user.firstName} ${data.user.lastName}`
            : data.user.phoneNumber,
      },
      { header: "Sitio", render: (data) => data.user.sitio.name },
      { header: "Material Name", render: (data) => data?.isAssorted === true ? "Assorted" : data?.material?.name },
      {
        header: "Category",
        render: (data) => data.isAssorted === true ? "Assorted" : data?.material?.category?.name,
      },
      {
        header: "Est. Value",
        render: (data) => `${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit}`,
      },
      {
        header: "Status",
        render: (data) => (
          <div className="flex items-center justify-center">
            <Pill type={data.status} />
          </div>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-center flex-row gap-3">
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
      { header: "Approved Date", render: (data) => formatDate(data.approvedAt) },
      {
        header: "Household",
        render: (data) =>
          data.user.firstName
            ? `${data.user.firstName} ${data.user.lastName}`
            : data.user.phoneNumber,
      },
      { header: "Sitio", render: (data) => data.user.sitio.name },
      { header: "Material Name", render: (data) => data?.isAssorted === true ? "Assorted" : data?.material?.name },
      { header: "Category", render: (data) => data.isAssorted === true ? "Assorted" : data?.material?.category?.name },
      {
        header: "Est. Value",
        render: (data) => `${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit}`,
      },
      {
        header: "Pickup Schedule",
        render: (data) => (
          <div className="flex items-center justify-center">
            <Pill type={data.isScheduled ? "SCHEDULED" : "NOT_SCHEDULED"} />
          </div>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-center flex-row gap-3">
             <button className="text-gray-600 hover:underline" onClick={() => router.push(`/collection-requests/${data.id}`)}>View</button>
            <ApprovedActions
              id={data.id}
              onSuccess={() => handleRefetchCount()}
            />
          </div>
        ),
      },
    ],
    IN_PROGRESS: [
      { header: "Approved Date", render: (data) => formatDate(data.approvedAt) },
      {
        header: "Household",
        render: (data) =>
          data.user.firstName
            ? `${data.user.firstName} ${data.user.lastName}`
            : data.user.phoneNumber,
      },
      { header: "Sitio", render: (data) => data.user.sitio.name },
      { header: "Material Name", render: (data) => data?.isAssorted === true ? "Assorted" : data?.material?.name },
      { header: "Category", render: (data) => data.isAssorted === true ? "Assorted" : data?.material?.category?.name },
      {
        header: "Est. Value",
        render: (data) => `${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit}`,
      },
      {
        header: "Status",
        render: (data) => (
          <div className="flex items-center justify-center">
            <Pill type={data.status} />
          </div>
        ),
      },
      {
        header: "Pickup Schedule",
        render: (data) => (
          <div className="flex items-center justify-center">
            <Pill type={data.isScheduled ? "SCHEDULED" : "NOT_SCHEDULED"} />
          </div>
        ),
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-center flex-row gap-3">
            <button className="text-gray-600 hover:underline" onClick={() => router.push(`/collection-requests/${data.id}`)}>View</button>
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
      { header: "Collection Date", render: (data) => formatDate(data.collectedAt) },
      {
        header: "Household",
        render: (data) =>
          data.user.firstName
            ? `${data.user.firstName} ${data.user.lastName}`
            : data.user.phoneNumber,
      },
      { header: "Sitio", render: (data) => data.user.sitio.name },
      { header: "Material Name", render: (data) => data?.isAssorted === true ? "Assorted" : data?.material?.name },
      { header: "Category", render: (data) => data.isAssorted === true ? "Assorted" : data?.material?.category?.name },
      {
        header: "Est. Value",
        render: (data) => `${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit}`,
      },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-center">
            <button className="text-gray-600 hover:underline" onClick={() => router.push(`/collection-requests/${data.id}`)}>View Details</button>
          </div>
        ),
      },
    ],
    REJECTED: [
      { header: "Date Requested", render: (data) => formatDate(data.createdAt) },
      {
        header: "Household",
        render: (data) =>
          data.user.firstName
            ? `${data.user.firstName} ${data.user.lastName}`
            : data.user.phoneNumber,
      },
      { header: "Sitio", render: (data) => data.user.sitio.name },
      { header: "Material Name", render: (data) => data?.isAssorted === true ? "Assorted" : data?.material?.name },
      { header: "Category", render: (data) => data.isAssorted === true ? "Assorted" : data?.material?.category?.name },
      {
        header: "Est. Value",
        render: (data) => `${data.estimatedValue} ${data.estimatedUnit === "PIECE" ? "pcs" : data.estimatedUnit}`,
      },
      { header: "Rejection Reason", render: (data) => data.rejectionReason },
      {
        header: "Action",
        render: (data) => (
          <div className="flex items-center justify-center">
            <button className="text-gray-600 hover:underline" onClick={() => router.push(`/collection-requests/${data.id}`)}>View Details</button>
          </div>
        ),
      },
    ],
  };

  const columns = tableConfig[status];

  const filteredRequest = data?.filter((req) => req.status === status);

  

  return (
    <Card
      className={`${inter.className} hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead className="border-b border-[#E6EFF5]">
          <tr className="">
            {columns?.map((col) => (
              <th className="font-medium text-base p-4" key={col.header}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="">
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
                <Error handleRefetchCount={handleRefetchCount}/>
              </td>
            </tr>
          )}
          {filteredRequest?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={9}>
                <Empty text={"No items"} subtext={"There are no item in this tab yet. Please go to the Pending tab to update status of pickup requests"}/>
              </td>
            </tr>
          ) : (
            filteredRequest?.map((req) => (
              <tr
                className={`text-center hover:bg-[#f8f8f8] transition-all transform ${isLoading && "hidden"}`}
                key={req.id}
              >
                {columns?.map((col) => (
                  <td key={col.header} className="p-3">
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
