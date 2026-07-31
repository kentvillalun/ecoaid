import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const Spinner = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-full p-20 text-center ${className}`}
    >
      <div className="animate-spin">
        <ArrowPathIcon className="w-9 stroke-accent" />
      </div>
      <div className="">
        <p className="text-xl font-semibold text-text-primary">
          Loading. Please wait
        </p>
        <p className="text-sm text-text-secondary">Items are currently loading</p>
      </div>
    </div>
  );
};
