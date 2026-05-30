"use client";

import { PlusIcon } from "@heroicons/react/24/outline";

export const SectionHeader = ({
  icon,
  title,
  subtitle,
  buttonLabel,
  onAction,
  buttonIcon = <PlusIcon className="w-5 hidden md:flex" />,
  buttonClassName,
  noButton = false,
  className = ""
}) => {
  return (
    <header className={`${className}`}>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          <div className="new-border p-3  rounded-xl md:flex items-center hidden bg-white">
            {icon}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 items-center">
              <h4 className="font-semibold text-[16px]">{title}</h4>
            </div>
            <p className="text-gray-600 text-[14px]">{subtitle}</p>
          </div>
        </div>
        {!noButton && (
          <button
            className={`gradient-button text-white new-border px-3.5 rounded-lg py-2.5 flex flex-row items-center gap-2 justify-center hover:cursor-pointer transition-all duration-200 ease-in-out min-w-35 md:min-w-45 text-nowrap ${buttonClassName}`}
            onClick={onAction}
          >
            {buttonIcon}
            <p className="md:text-md text-sm ">{buttonLabel}</p>
          </button>
        )}
      </div>
    </header>
  );
};
