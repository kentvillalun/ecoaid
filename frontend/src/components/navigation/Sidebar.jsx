import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon as DashboardIcon,
  InboxStackIcon as RequestIcon,
  UserIcon as ResidentsIcon,
  MegaphoneIcon as AnnoucementsIcon,
  CubeIcon as MaterialStockIcon,
  BanknotesIcon as JunkshopSalesIcon,
  ChartBarIcon as ReportsIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowLeftStartOnRectangleIcon as LogoutIcon,
  ArrowsRightLeftIcon as CollectionSortingIcon,
  GiftIcon as RedemptionProgramIcon,
  ClipboardDocumentCheckIcon as RewardsIcon,
  WalletIcon as ProgramFundsIcon,
  TrophyIcon as LeaderboardIcon,
} from "@heroicons/react/24/solid";
import { useContext, useState } from "react";
import { DrawerContext } from "@/app/(barangay)/layout.jsx";
import Link from "next/link";
import { Inter } from "next/font/google";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFetch } from "@/hooks/useFetch";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useContext(DrawerContext);
  const router = useRouter();
  // const {isLoading, data} = useFetch({ url: "/api/auth/barangay/me"})

  const topLevelItems = [
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: RequestIcon,
      label: "Collection Requests",
      href: "/collection-requests",
    },
    {
      icon: CollectionSortingIcon,
      label: "Manual Intake",
      href: "/manual-intake",
    },
    {
      icon: ResidentsIcon,
      label: "Residents",
      href: "/residents",
    },
  ];

  const managementItems = [
    {
      icon: MaterialStockIcon,
      label: "Material Stock",
      href: "/material-stock",
    },
    {
      icon: RedemptionProgramIcon,
      label: "Redemption",
      href: "/redemption",
    },
    {
      icon: RewardsIcon,
      label: "Reward ",
      href: "/reward-inventory",
    },
    {
      icon: JunkshopSalesIcon,
      label: "Junkshop Sales",
      href: "/junkshop-sales",
    },
    {
      icon: ProgramFundsIcon,
      label: "Program Funds",
      href: "/program-funds",
    },
  ];

  const communicationItems = [
    {
      icon: AnnoucementsIcon,
      label: "Announcements",
      href: "/announcements",
    },
    {
      icon: LeaderboardIcon,
      label: "Leaderboard",
      href: "/leaderboard",
    },
    {
      icon: ReportsIcon,
      label: "Reports",
      href: "",
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      href: "/settings",
    },
  ];

  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);

  const renderNavItem = (item) => (
    <Link
      className="flex flex-row gap-3 hover:cursor-pointer p-2 rounded-lg hover:bg-accent/10  transition-all ease-in-out items-center"
      key={item.label}
      href={item.href}
    >
      <item.icon className="h-6 w-6 md:block hidden hover:cursor-pointer" />
      <label className="font-medium text-md hover:cursor-pointer">
        {item.label}
      </label>
    </Link>
  );

  const renderGroup = (label, items, isOpen, setIsOpen) => (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex flex-row items-center justify-between w-full p-2 hover:cursor-pointer"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {label}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 lg:gap-3 border-l-2 border-white/10 ml-3 pl-2">
            {items.map(renderNavItem)}
          </div>
        </div>
      </div>
    </div>
  );

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/barangay/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Logout failed");
        return;
      }

      router.push("/barangay/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  

  return (
    <aside
      className={`w-60 md:w-65 h-svh flex flex-col gradient-card fixed top-0 text-white left-0 z-50 md:shadow-xl ${inter.className} overflow-y-auto sidebar`}
    >
      <div className="p-4 flex flex-col gap-4 lg:gap-9">
        
        <div className="flex flex-row justify-between items-center">
          <div className="max-w-40 relative w-full aspect-3/1">
            <Image
              src="/ecoaid-logo/white-logo-wordmark.svg"
              alt="EcoAid logo"
              fill
              priority
            />
          </div>
          <div className="md:hidden">
            <XMarkIcon
              className="w-6 h-6  hover:cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pl-2 lg:gap-3">
          {topLevelItems.map(renderNavItem)}

          {renderGroup(
            "Management",
            managementItems,
            isManagementOpen,
            setIsManagementOpen,
          )}

          {renderGroup(
            "Communication",
            communicationItems,
            isCommunicationOpen,
            setIsCommunicationOpen,
          )}
        </div>
      </div>
      <div className="mt-auto">
        <button className="pl-6 p-4 mb-15 w-full" onClick={handleLogout}>
          <div className="flex flex-row gap-3 hover:cursor-pointer p-2 rounded-lg hover:bg-accent/10 transition-all ease-in-out">
            <LogoutIcon className="h-6 w-6 md:block hidden hover:cursor-pointer" />
            <label className="font-medium text-md hover:cursor-pointer">
              Logout
            </label>
          </div>
        </button>
      </div>
    </aside>
  );
};
