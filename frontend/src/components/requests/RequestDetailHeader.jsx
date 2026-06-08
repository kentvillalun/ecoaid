"use client";

import { Card } from "../ui/Card";
import { ArrowLeftIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "../ui/StatusBadge";

export const RequestDetailHeader = ({ type }) => {
  return (
    <Card className="flex flex-row items-center gap-4 shadow-none! new-border">
      <button
        className="flex items-center justify-center w-9 h-9 rounded-lg  hover:bg-gray-50 transition-colors hover:cursor-pointer"
        onClick={() => history.back()}
      >
        <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
      </button>

      <div className="flex flex-row gap-4 items-center flex-1">
        <div className="border p-3 border-gray-200 rounded-lg md:flex items-center hidden bg-white">
          <ClipboardDocumentListIcon className="w-6 stroke-black" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex flex-row items-center gap-3">
            <h2 className="font-semibold text-xl">Request Details</h2>
            <StatusBadge type={type} />
          </div>
          <p className="text-sm text-gray-500">Review the full details of this pickup request</p>
        </div>
      </div>
    </Card>
  );
};
