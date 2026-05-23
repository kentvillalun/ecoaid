"use client";

import { formatDate } from "@/lib/formatDate";
import { Card } from "../ui/Card";
import { Inter } from "next/font/google";
import { MaterialPill } from "../ui/MateriaPill";
import { Spinner } from "../ui/Spinner";
import { Empty } from "../ui/Empty";
import { Error } from "../ui/Error";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const TransactionTable = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const tableConfig = [
    {
      header: "Beneficiary",
      render: (data) => (
        <div className="flex flex-col items-start justify-center">
          <p className="text-md font-semibold">{data.beneficiaryName}</p>
          <p className="capitalize text-gray-400">
            {" "}
            {data.educationalLevel.toLowerCase()} level
          </p>
          <p className="capitalize text-gray-400 text-sm">
            Collected by: {data.collectorName}{" "}
          </p>
        </div>
      ),
    },
    {
      header: "Program",
      render: (data) => (
        <div className="font-semibold">
          {data?.programMaterial?.program?.name}{" "}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${data?.programMaterial?.program?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {data?.programMaterial?.program?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      header: "Material",
      render: (data) => (
        <div className="flex items-center w-full flex-col">
          <MaterialPill className="w-auto!"
            type={data?.programMaterial?.material?.category?.name}
            materialName={data?.programMaterial?.material?.name}
          />
        </div>
      ),
    },
    {
      header: "Qty",
      render: (data) => <span className="font-semibold">{data.quantity}</span>,
    },
    {
      header: "Values",
      render: (data) => (
        <span className="text-green-600 font-bold">
           {data?.programMaterial?.program?.isCashMode ? `₱${data.quantity * data.currentValue}` : `${data.quantity * data.currentValue} pts`}
        </span>
      ),
    },
    {
      header: "Date",
      render: (data) => formatDate(data.createdAt),
    },
  ];

  return (
    <Card
      className={`${inter.className} hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start`}
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
          {isLoading && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Spinner />
              </td>
            </tr>
          )}

          {isError && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Error handleRefetchCount={handleRefetchCount} />
              </td>
            </tr>
          )}
          {data?.transactions?.length === 0 ? (
            <tr className="max-w-md">
              <td className="text-center" colSpan={6}>
                <Empty
                  text={"No transaction yet"}
                  subtext={"There are no redemption transaction yet"}
                />
              </td>
            </tr>
          ) : (
            data?.transactions?.map((t) => (
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
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
};
