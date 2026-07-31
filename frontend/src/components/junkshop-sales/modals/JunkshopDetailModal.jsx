"use client";

import { createPortal } from "react-dom";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { formatDate } from "@/lib/formatDate";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const formatUnit = (unit) =>
  unit === "PIECE" ? "pcs" : (unit ?? "").toLowerCase();

export function JunkshopDetailModal({
  isOpen,
  onClose,
  junkshop = "",
  setIsJunkshopModalOpen,
  setIsModalOpen,
  setPreselectedJunkshop,
}) {
  const { data, isLoading } = useFetch({
    url: `/api/junkshop-sales/junkshop/${junkshop}`,
  });

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<BuildingStorefrontIcon className="w-6 stroke-accent" />}
      title={
        <div className="flex flex-row gap-1">
          {isLoading ? (
            <>
              <Skeleton width={165} />
              <Skeleton width={95} />
            </>
          ) : (
            <>
              <p className="">{data?.junkshop?.name}</p>
              <Badge
                label={
                  data?.junkshop?.isAvailable ? "Available" : "Unavailable"
                }
                color={
                  data?.junkshop?.isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }
              />
            </>
          )}
        </div>
      }
      subtitle="Junkshop details"
      cancelLabel="Close"
      confirmLabel="Record Sale"
      confirmClassName="gradient-button"
      onConfirm={() => {
        setIsJunkshopModalOpen(false);
        setIsModalOpen(true);
        setPreselectedJunkshop(junkshop);
      }}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="label">Status</label>
          <div className="input bg-gray-50">
            {data?.junkshop?.isAvailable ? "Available" : "Unavailable"}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="label">Description</label>
          <textarea
            className="input mb-0 max-h-none bg-gray-50 cursor-default resize-none"
            rows={3}
            readOnly
            value={data?.junkshop?.description || "No description provided."}
          ></textarea>
        </div>

        {/* Location + Created At */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Location</label>
            <input
              type="text"
              className="input mb-0 bg-gray-50 cursor-default"
              readOnly
              value={data?.junkshop?.location || "Not specified"}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Junkshop Added</label>
            <input
              type="text"
              className="input mb-0 bg-gray-50 cursor-default"
              readOnly
              value={formatDate(data?.junkshop?.createdAt)}
            />
          </div>
        </div>

        {/* Price Items */}
        <div className="flex flex-col gap-1">
          <label className="label">Price Items</label>
          <div className="new-border bg-surface rounded-xl overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-2.5 px-4 font-medium text-gray-400 text-nowrap">
                    Material
                  </th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-400 text-nowrap">
                    Price
                  </th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-400 text-nowrap">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.junkshop?.priceItems?.length ? (
                  data?.junkshop?.priceItems?.map((item, i) => (
                    <tr key={item.id ?? i}>
                      <td className="py-2.5 px-4">
                        <MaterialTag
                          type={item.material?.category?.name}
                          materialName={item.material?.name}
                          textOnly={true}
                        />
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 font-medium tabular-nums text-nowrap">
                        ₱{item.price}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 text-nowrap">
                        {formatUnit(item.unit)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 px-4 text-center text-gray-400"
                    >
                      No price items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>,
    document.body,
  );
}
