"use client";

import { Page } from "@/components/layout/Page.jsx";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { ResidentHeader } from "@/components/navigation/ResidentHeader.jsx";
import { LanguageIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function SettingsPage() {
  const [toggled, setToggled] = useState(false);

  const SETTINGS_CONFIG = [
    {
      key: "language",
      title: "Laguage",
      icon: <LanguageIcon className="h-6 w-6 stroke-cta-color" />,
      isToggled: false,
    },
    {
      key: "dark-mode",
      title: "Dark Mode",
      icon: <MoonIcon className="h-6 w-6 stroke-cta-color" />,
      isToggled: false,
    },
  ];
  return (
    <Page className="bg-new-bg!">
      <ResidentHeader title={"Settings"} className="shadow-none bg-new-bg!" />

      <PageContent>
        <div className="">
          <div className="font-medium py-3 border-b border-[#E7E3E0] text-sm">
            <h2 className="">General</h2>
          </div>
          {SETTINGS_CONFIG.map((set) => (
            <div
              className="py-3 border-b border-[#E7E3E0] flex flex-row gap-2 items-center justify-between"
              key={set.key}
            >
              <div className="flex flex-row gap-3 items-center justify-center ">
                <div className="">{set.icon}</div>
                <h2 className="font-medium text-sm">{set.title}</h2>
              </div>
              <button
                className={`flex items-start ${toggled ? "justify-end bg-green-500/70" : "justify-start  bg-[#EFEFEF]"} min-w-12 p-1 rounded-full shadow-inner duration-200 transition-all ease-out`}
                role="switch"
                onClick={() => setToggled(!toggled)}
              >
                <span className="h-5 w-5 shadow rounded-full bg-white"></span>
              </button>
            </div>
          ))}
        </div>
      </PageContent>
    </Page>
  );
}
