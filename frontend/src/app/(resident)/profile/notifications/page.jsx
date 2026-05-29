"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { useState } from "react";


// TO-DO Implement a working toggle button

export default function NotificationSettingPage() {
  // const [latestConfigs, setLatestConfigs] = useState([]);
  const [toggled, setToggled] = useState(false);


  const NOTIF_OPT = [
    {
      key: "request-status-updates",
      title: "Request Status Updates",
      description: "Receive updates when your request is updated or completed.",
      isToggled: false,
    },
    {
      key: "barangay-updates",
      title: "Barangay Updates",
      description:
        "Get updates about recycling schedules, programs, and important announcement from your barangay.",
      isToggled: false,
    },
  ];

  // const toggle = () => {
  //   setLatestConfigs([...NOTIF_OPT, latestConfigs ])
  // }


  return (
    <Page className="bg-new-bg!">
      <ResidentHeader title={"Notification Settings"} className="shadow-none! bg-new-bg!"/>

      <PageContent>
        <div className="">
          <div className="font-medium py-3 border-b border-[#E7E3E0] text-sm">
            <h2 className="">Transaction Updates</h2>
          </div>
          {NOTIF_OPT.map((opt) => (
            <div className="py-3 border-b border-[#E7E3E0] flex flex-row gap-2 items-center justify-between" key={opt.key}>
              <div className="flex flex-col gap-1">
                <h2 className="font-medium text-sm">{opt.title}</h2>
                <p className="text-xs">{opt.description}</p>
              </div>
              <button
                className={`flex items-start ${toggled ? "justify-end bg-green-500/70" : "justify-start  bg-[#EFEFEF]" } min-w-12 p-1 rounded-full shadow-inner duration-200 transition-all ease-out`}
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
