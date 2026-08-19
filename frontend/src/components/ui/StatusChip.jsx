import { Inter } from "next/font/google";
import { FunnelIcon } from "@heroicons/react/24/outline";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Generic filter-tab bar with per-tab counts. Works for any data shape:
// the consuming page passes `getItemValue` to tell StatusChip how to read
// the comparable field off each row (e.g. `(item) => item.status`).
// STATUS_TABS must be a module-level array (stable reference across
// re-renders) since `currentTab` is compared/set by `tab.key` identity.
export const StatusChip = ({
  STATUS_TABS,
  currentTab,
  setCurrentTab,
  data,
  getItemValue,
}) => {
  return (
    <div className="gap-2 flex flex-row items-center justify-start overflow-x-auto pb-3 min-h-15 md:min-h-5 overflow-y-hidden">
      <div className="flex flex-row text-gray-600 text-sm items-center justify-center gap-1">
        <FunnelIcon className="w-4" />
        <p>Filter:</p>
      </div>
      {STATUS_TABS.map((tab) => {
        const isActive = currentTab === tab.key;
        const count = tab.key.includes("ALL")
          ? (data?.length ?? 0)
          : (data?.filter((item) => tab.key.includes(getItemValue?.(item)))
              .length ?? 0);

        return (
          <button
            className={`${inter.className}  py-1.5 flex flex-row gap-1 px-3 text-sm rounded-xl ${isActive ? "gradient-button text-white" : "text-gray-600 bg-surface"} transition-all ease-in-out hover:cursor-pointer duration-300 text-nowrap new-border`}
            key={tab.label}
            onClick={() => setCurrentTab(tab.key)}
          >
            <h2 className="font-medium">{tab.label}</h2>
            <h2 className="">({count})</h2>
          </button>
        );
      })}
    </div>
  );
};
