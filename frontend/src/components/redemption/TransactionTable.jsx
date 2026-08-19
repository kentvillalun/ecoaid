"use client";

import { formatDate } from "@/lib/formatDate";
import { formatCurrency } from "@/lib/formatCurrency";
import { Card } from "../ui/Card";
import { Inter } from "next/font/google";

import { Spinner } from "../ui/Spinner";
import { Empty } from "../ui/Empty";
import { Error } from "../ui/Error";
import { HoverPortal } from "../ui/HoverReveal";
import { MaterialTag } from "../ui/MaterialTag";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function TransactionMaterialsBreakdown({ items, isCashMode }) {
  const total = items?.reduce(
    (sum, item) => sum + item.amount * item.currentValue,
    0,
  );

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left pb-2 pr-2 font-medium text-gray-400 text-nowrap">
            Material
          </th>
          <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">
            Amount
          </th>
          <th className="text-start pb-2 pr-1 font-medium text-gray-400 text-nowrap">
            Value
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {items?.map((item, i) => (
          <tr key={item.id ?? i}>
            <td className="py-2 pr-4">
              <MaterialTag
                type={item?.programMaterial?.material?.category?.name}
                materialName={item?.programMaterial?.material?.name}
                textOnly={true}
              />
            </td>
            <td className="text-start py-2 pr-1 text-gray-600 tabular-nums text-nowrap lowercase">
              {item?.amount}{" "}
              {item?.programMaterial?.material?.defaultUnit === "PIECE"
                ? "pcs"
                : item?.programMaterial?.material?.defaultUnit}
            </td>
            <td className="text-start py-2 pr-1 font-semibold text-text-primary tabular-nums text-nowrap">
              {isCashMode
                ? formatCurrency(item.amount * item.currentValue)
                : `${item.amount * item.currentValue} pts`}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-gray-100">
          <td
            className="pt-2 pr-4 font-semibold text-text-primary"
            colSpan={2}
          >
            Total
          </td>
          <td className="pt-2 pr-1 font-bold text-text-primary tabular-nums text-nowrap">
            {isCashMode ? formatCurrency(total) : `${total} pts`}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export const TransactionTable = ({
  data,
  isLoading,
  isError,
  handleRefetchCount,
}) => {
  const router = useRouter();

  const tableConfig = [
    {
      header: "Beneficiary",
      render: (data) => (
        <div className="flex flex-col items-start justify-center">
          <p className="font-semibold text-text-primary">
            {data.beneficiaryName}
          </p>
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
        <div className="">
          {data?.program?.name}{" "}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${data.program?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {data?.program?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      header: "Materials",
      render: (data) => {
        const items = data?.redemptionTransactionItem ?? [];
        const visible = items.slice(0, 2);
        const hidden = items.slice(2);

        return (
          <HoverPortal
            content={
              <TransactionMaterialsBreakdown
                items={items}
                isCashMode={data?.program?.isCashMode}
              />
            }
          >
            {visible.map((item, i) => (
              <MaterialTag
                key={item.id ?? i}
                type={item?.programMaterial?.material?.category?.name}
                materialName={item?.programMaterial?.material?.name}
              />
            ))}
            {hidden.length > 0 && (
              <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full bg-gray-100 select-none">
                +{hidden.length} more
              </span>
            )}
          </HoverPortal>
        );
      },
    },
    {
      header: "Values",
      render: (data) => (
        <span className="">
          {data?.isCashMode
            ? `₱ ${data?.redemptionTransactionItem?.reduce((sum, item) => sum + item.amount * item.currentValue, 0)}`
            : `${data?.redemptionTransactionItem?.reduce((sum, item) => sum + item.amount * item.currentValue, 0)} pts `}
        </span>
      ),
    },
    {
      header: "Date",
      render: (data) => formatDate(data.createdAt),
    },
    {
      header: "Action",
      render: (data) => (
        <div className="flex items-center justify-start">
          <button
            className="text-gray-600 hover:underline hover:cursor-pointer"
            onClick={() => router.push(`/redemption/transactions/${data.id}`)}
          >
            View Details
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card
      className={`${inter.className} hidden md:flex md:flex-col px-8  overflow-x-auto md:gap-3 md:items-start shadow-none! new-border`}
    >
      <table className="w-full text-sm border-collapse text-nowrap text-gray-600">
        <thead className="border-b border-border">
          <tr className="">
            {tableConfig.map((col) => (
              <th className="font-medium text-start p-4" key={col.header}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
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
                className="text-start hover:bg-bg transition-all transform"
                key={t.id}
              >
                {tableConfig.map((col) => (
                  <td key={col.header} className="p-4">
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
