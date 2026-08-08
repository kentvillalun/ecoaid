import {
  HomeIcon,
  InboxStackIcon,
  UserIcon,
  MegaphoneIcon,
  CubeIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  GiftIcon,
  ClipboardDocumentCheckIcon,
  WalletIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
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
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { DrawerContext } from "@/app/(barangay)/layout.jsx";
import Link from "next/link";
import { Inter } from "next/font/google";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useContext(DrawerContext);
  const router = useRouter();
  const pathName = usePathname();
  // const {isLoading, data} = useFetch({ url: "/api/auth/barangay/me"})


  const topLevelItems = [
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/dashboard",
      solidIcon: HomeIcon,
    },
    {
      icon: RequestIcon,
      label: "Collection Requests",
      href: "/collection-requests",
      solidIcon: InboxStackIcon,
    },
    {
      icon: CollectionSortingIcon,
      label: "Manual Intake",
      href: "/manual-intake",
      solidIcon: ArrowsRightLeftIcon,
    },
    {
      icon: ResidentsIcon,
      label: "Residents",
      href: "/residents",
      solidIcon: UserIcon,
    },
  ];

  const managementItems = [
    {
      icon: MaterialStockIcon,
      label: "Material Stock",
      href: "/material-stock",
      solidIcon: CubeIcon,
    },
    {
      icon: RedemptionProgramIcon,
      label: "Redemption",
      href: "/redemption",
      solidIcon: GiftIcon,
    },
    {
      icon: RewardsIcon,
      label: "Reward ",
      href: "/reward-inventory",
      solidIcon: ClipboardDocumentCheckIcon,
    },
    {
      icon: JunkshopSalesIcon,
      label: "Junkshop Sales",
      href: "/junkshop-sales",
      solidIcon: BanknotesIcon,
    },
    {
      icon: ProgramFundsIcon,
      label: "Program Funds",
      href: "/program-funds",
      solidIcon: WalletIcon,
    },
  ];

  const communicationItems = [
    {
      icon: AnnoucementsIcon,
      label: "Announcements",
      href: "/announcements",
      solidIcon: MegaphoneIcon,
    },
    {
      icon: LeaderboardIcon,
      label: "Leaderboard",
      href: "/leaderboard",
      solidIcon: TrophyIcon,
    },
    {
      icon: ReportsIcon,
      label: "Reports",
      href: "/reports",
      solidIcon: ChartBarIcon,
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      href: "/settings",
      solidIcon: Cog6ToothIcon,
    },
  ];

  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);

  const renderNavItem = (item) => (
    <Link
      className={`flex flex-row gap-3.5 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-accent/10 transition-all ease-in-out items-center group ${pathName === item.href ? "gradient-button" : ""}`}
      key={item.label}
      href={item.href}
    >
      {pathName === item.href ? (
        <item.solidIcon className="h-4 w-4 md:block hidden" />
      ) : (
        <item.icon className="h-4 w-4 md:block hidden hover:cursor-pointer stroke-text-secondary group-hover:stroke-accent " />
      )}

      <label
        className={`text-base hover:cursor-pointer  ${pathName === item.href ? "text-surface" : "text-text-secondary group-hover:text-accent"}`}
      >
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
        className="flex flex-row items-center justify-between w-full p-2 hover:cursor-pointer text-text-secondary"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
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
          <div className="flex flex-col gap-2 lg:gap-3 border-l-2 border-white/10 pl-2">
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
      className={`w-60 md:w-65 h-svh flex flex-col bg-surface fixed top-0 text-white left-0 z-50 ${inter.className} overflow-y-auto sidebar new-border`}
    >
      <div className="md:hidden flex pt-4 pr-4 items-end w-full justify-end">
        <XMarkIcon
          className="w-6 h-6  hover:cursor-pointer stroke-text-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="p-4 flex flex-col gap-4 lg:gap-9">
        <div className="flex flex-row justify-start gap-2 border-b-border border pb-4">
          <div className="max-w-10 relative w-full aspect-square">
            <Image
              src="/ecoaid-logo/logo-w-container.svg"
              alt="EcoAid logo"
              fill
              priority
            />
          </div>
          <div className="flex flex-col gap-0">
            <p className="font-baloo text-xl text-dark font-medium leading-none">
              ecoaid
            </p>
            <p className="text-text-secondary text-xs">Recycling Management</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:gap-3">
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
          <div className="flex flex-row gap-3 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-accent/10 transition-all ease-in-out items-center group">
            <LogoutIcon className="h-4 w-4 md:block hidden hover:cursor-pointer group-hover:stroke-accent stroke-text-secondary" />
            <label className="text-base text-text-secondary hover:cursor-pointer group-hover:text-accent">
              Logout
            </label>
          </div>
        </button>
      </div>
    </aside>
  );
};
