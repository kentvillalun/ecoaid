import { Inter } from "next/font/google";
import { FunnelIcon } from "@heroicons/react/24/outline";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const StatusChip = ({ STATUS_TABS, currentTab, setCurrentTab, data }) => {
  
console.log(currentTab)
  return (
    <div className="gap-2 flex flex-row items-center justify-start overflow-x-auto pb-3 min-h-15 md:min-h-5 overflow-y-hidden" >
      <div className="flex flex-row text-gray-600 text-sm items-center justify-center gap-1 ">
        <FunnelIcon className="w-4"/>
        <p className="">Filter:</p>
      </div>
      {STATUS_TABS.map((tab) => {
        const isActive = currentTab === tab.label;

        return (
          <button
            className={`${inter.className}  py-1.5 flex flex-row gap-1 px-3 text-sm rounded-xl ${isActive ? "gradient-button text-white" : "text-gray-600 bg-surface"} transition-all ease-in-out hover:cursor-pointer duration-300 text-nowrap new-border` }
            key={tab.key}
            onClick={() => setCurrentTab(tab.label)}
          >
            <h2 className="font-medium">{tab.label}</h2>
            <h2 className="">({tab.key.includes("ALL") ? data?.length : data?.filter(item => tab.key.includes(item.status)).length})</h2>
          </button>
        );
      })}
    </div>
  );
};
