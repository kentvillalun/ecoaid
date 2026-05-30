import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const Spinner = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-full p-20 text-center ${className}`}
    >
      <div className="animate-spin">
        <ArrowPathIcon className="w-9 stroke-cta-color" />
      </div>
      <div className="">
        <p className="text-xl font-semibold text-[#1F2937]">
          Loading. Please wait
        </p>
        <p className="text-sm text-[#6B7280]">Items are currently loading</p>
      </div>
    </div>
  );
};
