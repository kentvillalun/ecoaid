import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { Error } from "../ui/Error";
import { Empty } from "../ui/Empty";
import { formatDate } from "@/lib/formatDate";
import { MaterialPill } from "../ui/MateriaPill";
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
      header: "Date created",
      render: (data) => (
        <span className=""> {formatDate(data?.request?.createdAt)} </span>
      ),
    },
    {
      header: "Household",
      render: (data) => (
        <span className="">
          {" "}
          {data?.request?.user?.firstName} {data?.request?.user?.lastName}
        </span>
      ),
    },
    {
      header: "Material",
      render: (data) => (
        <div className="flex items-center w-full justify-center">
          <MaterialPill
            type={
              data?.request?.isAssorted === true
                ? "Assorted"
                : data?.request?.material?.category?.name
            }
          />
        </div>
      ),
    },
    {
      header: "Actual values",
      render: (data) => (
        <span className="lowercase">
          {data?.actualValue} {data?.actualUnit === "PIECE" ? "pcs" : data?.actualUnit}
        </span>
      ),
    },
    {
      header: "Source",
      render: () => <span className="">Pickup Request</span>,
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
      className={` hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead className="border-b border-[#E6EFF5]">
          <tr className="">
            {tableConfig.map((col) => (
              <th className="font-medium text-base p-4" key={col.header}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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
                  className="text-center hover:bg-[#f8f8f8] transition-all transform"
                  key={t.id}
                >
                  {tableConfig.map((col) => (
                    <td key={col.header} className="p-3">
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
