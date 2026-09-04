"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialTag } from "@/components/ui/MaterialTag";
import { formatDate } from "@/lib/formatDate";

// variant "compact" -> Home screen (Recent Requests)
// variant "list" -> Requests & History page
export const ResidentRequestCard = ({ request: r, variant = "compact" }) => {
  const router = useRouter();

  const handleClick = () => router.push(`/requests/${r.id}`);

  if (variant === "list") {
    return (
      <Card
        className="flex-col! items-start! gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out shadow-none! new-border"
        handleClick={handleClick}
      >
        {/* Top row */}
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row gap-3">
            <div className="flex flex-col items-start h-16 w-16 rounded-md overflow-hidden shrink-0">
              <Image
                src={r?.photoUrl}
                width={64}
                height={64}
                alt="Recyclables"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold text-text-primary capitalize">
                {r.isAssorted === true ? "Assorted Request" : r.material?.name}
              </h3>
              <p className="text-xs text-gray-500">
                {r.notes ? r.notes : "No notes available"}
              </p>
              <p className="text-xs text-gray-400">
                Est. {r.estimatedValue}{" "}
                <span className="lowercase">
                  {r.estimatedUnit === "PIECE" ? "pcs" : r.estimatedUnit}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <StatusBadge type={r.status} />
            <MaterialTag
              type={
                r?.isAssorted === true
                  ? "Assorted"
                  : r?.material?.category?.name
              }
            />
          </div>
        </div>

        {/* Footer row */}
        <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex-col! items-start! gap-3 transition-all hover:cursor-pointer hover:-translate-y-0.5 duration-200 ease-in-out new-border shadow-none"
      handleClick={handleClick}
    >
      {/* Top row */}
      <div className="flex flex-col gap-1 justify-between w-full">
        <div className="flex flex-row gap-0.5 items-center h-auto justify-between w-full">
          <MaterialTag
            type={r?.material?.category?.name ?? "Assorted"}
            materialName={r?.material?.name ?? "Assorted"}
            textOnly={true}
            className="text-sm"
          />

          <div className="flex flex-col items-end gap-2">
            <StatusBadge type={r.status} />
          </div>
        </div>
        <p className="text-xs text-text-secondary">{formatDate(r.createdAt)}</p>
      </div>

      {/* Footer row */}
      <div className="flex flex-row items-end justify-end w-full pt-2 border-t border-gray-100">
        <p className="text-xs text-text-secondary">
          Est. {r.estimatedValue}{" "}
          <span className="lowercase">
            {r.estimatedUnit === "PIECE" ? "pcs" : r.estimatedUnit}
          </span>
        </p>
      </div>
    </Card>
  );
};
