" use client"

import { AddJunkshopModal } from "../junkshop-sales/modals/AddJunkshopModal";
import { SectionHeader } from "../ui/SectionHeader";
import Link from "next/link";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { Error } from "../ui/Error";
import { Badge } from "../ui/Badge";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TABLE_HEADERS = ["Junkshop", "Location", "Status"];
export const JunkshopSection = () => {
  const [isAddJunkshopModalOpen, setIsAddJunkshopModalOpen] = useState(false);

  const [refetchCount, setRefetchCount] = useState(0);
  const { data, isLoading, isError } = useFetch({
    url: "/api/junkshop-sales/junkshop",
    refetchCount,
  });

  const handleRefetchCount = () => setRefetchCount((prev) => prev + 1);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <SectionHeader
          title="Junkshops"
          subtitle="Manage junkshop partners and their price listings"
          icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
          buttonLabel="Add Junkshop"
          onAction={() => setIsAddJunkshopModalOpen(true)}
        />
        <p className="text-sm text-gray-600">
          To view junkshop details, go to the{" "}
          
          <Link href={"/junkshop-sales"} className="text-accent font-semibold">Junkshop Sales </Link>
          page and press the junkshop name.
        </p>
      </div>

      {/* Desktop table */}
      <Card
        className={`hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse text-gray-600">
            <thead className="border-b border-border">
              <tr>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="font-medium text-start p-4 text-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={3}>
                    <Spinner />
                  </td>
                </tr>
              ) : isError ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={3}>
                    <Error
                      handleRefetchCount={handleRefetchCount}
                      subtext={
                        "Unable to get your junkshops. Please try again."
                      }
                    />
                  </td>
                </tr>
              ) : data?.junkshops?.length === 0 ? (
                <tr className="max-w-md">
                  <td className="text-center" colSpan={3}>
                    <Empty
                      text={"No junkshops yet"}
                      subtext={
                        "No junkshop partners found. Press the add junkshop button above to add one."
                      }
                    />
                  </td>
                </tr>
              ) : (
                data?.junkshops?.map((shop) => (
                  <tr
                    key={shop.id}
                    className="hover:bg-bg transition-all duration-150"
                  >
                    <td className="p-4 font-medium text-text-primary text-nowrap">
                      {shop.name}
                    </td>
                    <td className="p-4 text-nowrap">{shop.location}</td>
                    <td className="p-4">
                      <Badge
                        label={shop.isAvailable ? "Available" : "Unavailable"}
                        color={
                          shop.isAvailable
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="flex md:hidden flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="flex flex-col items-start gap-2 shadow-none! new-border"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <Skeleton width={150} />
                <Skeleton width={70} />
              </div>
              <Skeleton width={180} />
            </Card>
          ))
        ) : isError ? (
          <Error
            handleRefetchCount={handleRefetchCount}
            subtext={"Unable to get your junkshops. Please try again."}
          />
        ) : data?.junkshops?.length === 0 ? (
          <Empty
            text={"No junkshops yet"}
            subtext={
              "No junkshop partners found. Press the add junkshop button above to add one."
            }
          />
        ) : (
          data?.junkshops?.map((shop) => (
            <Card
              key={shop.id}
              className="flex flex-col items-start gap-2 shadow-none! new-border"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <p className="text-sm font-semibold text-text-primary">
                  {shop.name}
                </p>
                <Badge
                  label={shop.isAvailable ? "Available" : "Unavailable"}
                  color={
                    shop.isAvailable
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }
                />
              </div>
              <p className="text-xs text-gray-500">{shop.location}</p>
            </Card>
          ))
        )}
      </div>

      <AddJunkshopModal
        isOpen={isAddJunkshopModalOpen}
        onClose={() => setIsAddJunkshopModalOpen(false)}
        setIsModalOpen={setIsAddJunkshopModalOpen}
        handleRefetchCount={handleRefetchCount}
      />
    </section>
  );
};
