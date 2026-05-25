"use client";

import { Inter } from "next/font/google";
import {
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Pill } from "./Pill";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  confirmLabel,
  confirmClassName,
  onConfirm,
  status,
  isPill,
  cancelLabel = "Cancel",
  buttonLabelSize = "text-md"
}) => {
  return (
    // blur background
    <>
      {isOpen && (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className={`fixed flex flex-col justify-center z-100 bg-white  rounded-2xl m-4 min-w-[90%] md:min-w-[45%] ${inter.className} max-h-[90%]`}
          >
            <div className="p-6 border-b border-gray-200 w-full">
              <div className="sticky flex flex-row items-center justify-between ">
                <div className="flex flex-row gap-4 items-center">
                  <div className="border p-3 border-gray-200 rounded-lg flex items-center ">
                    {/* <ExclamationTriangleIcon className="w-6 stroke-black" /> */}
                    {icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-4 items-center">
                      <h4 className="font-semibold text-[16px]">{title}</h4>
                      {isPill && <Pill type={status} />}
                    </div>
                    <p className="text-gray-600 text-[14px]">{subtitle}</p>
                  </div>
                </div>
                <div className="hover:cursor-pointer" onClick={onClose}>
                  <XCircleIcon className="w-8 stroke-gray-500" />
                </div>
              </div>
            </div>

            <form className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto flex-1 min-h-0">

                {/* Fields */}
                {children}
              </div>
              

              {/* buttons */}
              <div className={`grid grid-cols-2 font-medium gap-3 p-6 border-t border-gray-200 ${buttonLabelSize}`}>
                <button
                  className="py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:cursor-pointer"
                  onClick={onClose}
                  type="button"
                >
                  {cancelLabel}
                </button>
                <button
                  className={`py-2.5 ${confirmClassName}  text-white rounded-lg hover:cursor-pointer`}
                  onClick={onConfirm}
                  type="button"
                >
                  {confirmLabel}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
};
