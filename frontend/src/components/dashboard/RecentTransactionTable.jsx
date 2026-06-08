import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { Error } from "../ui/Error";
import { Empty } from "../ui/Empty";
import { formatDate } from "@/lib/formatDate";
import { MaterialTag } from "../ui/MaterialTag";
import { useRouter } from "next/navigation";

export const RecentTransactionTable = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter();

  const tableConfig = [
    {
      header: "Household",
      render: (data) => (
        <span className="font-semibold text-text-primary">
          {" "}
          {data?.request?.user?.firstName} {data?.request?.user?.lastName}
        </span>
      ),
    },
    {
      header: "Materials",
      render: (data) => (
        <div className="flex  items-center">
            {data?.request?.isAssorted === true ? (
              <MaterialTag
                materialName={"Assorted"}
                type={"Assorted"}
                textOnly={true}
              />
            ) : (
              <MaterialTag
                materialName={data?.request?.material?.name}
                type={data?.request?.material?.category?.name}
                textOnly={true}
              />
            )}
          </div>
      ),
    },
    {
      header: "Actual values",
      render: (data) => (
        <span className="lowercase">
          {data?.actualValue}{" "}
          {data?.actualUnit === "PIECE" ? "pcs" : data?.actualUnit}
        </span>
      ),
    },
    {
      header: "Source",
      render: () => <span className="">Pickup Request</span>,
    },
    {
      header: "Date created",
      render: (data) => (
        <span className=""> {formatDate(data?.request?.createdAt)} </span>
      ),
    },
    {
      header: "Action",
      render: (data) => (
        <button
          className="text-gray-600 hover:underline"
          onClick={() => {
            router.push(`/collection-requests/${data.requestId}`);
          }}
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <Card
      className={` hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead className="border-b border-[#E6EFF5]">
          <tr className="">
            {tableConfig.map((col) => (
              <th className="font-medium p-4 text-start text-gray-500" key={col.header}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600">
          {isLoading ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Spinner />
              </td>
            </tr>
          ) : isError ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Error
                  handleRefetchCount={handleRefetchCount}
                  subtext={"We cannot get your recent intakes"}
                />
              </td>
            </tr>
          ) : data?.recentTransactions?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Empty
                  text={"No recent intakes yet"}
                  subtext={"There are no recent intakes yet"}
                />
              </td>
            </tr>
          ) : (
            data?.recentTransactions?.map((t) => {
              console.log(t);
              return (
                <tr
                  className="text-start hover:bg-[#f8f8f8] transition-all transform"
                  key={t.id}
                >
                  {tableConfig.map((col) => (
                    <td key={col.header} className="p-4">
                      {col.render(t)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
};
