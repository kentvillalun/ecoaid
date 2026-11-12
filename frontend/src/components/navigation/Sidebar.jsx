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
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { DrawerContext } from "@/app/(barangay)/BarangayLayoutClient.jsx";
import Link from "next/link";
import { Inter } from "next/font/google";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Logo } from "../branding/Logo";
import { ROLE_MATRIX } from "@/lib/roles";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, role, user, modules } =
    useContext(DrawerContext);
  const router = useRouter();
  const pathName = usePathname();

  const MODULE_FLAG_MAP = {
    "/collection-requests": "hasCollectionRequests",
    "/redemption": "hasRedemptionManagement",
    "/reward-inventory": "hasRewardInventory",
    "/leaderboard": "hasLeaderboard",
  };

  const passesModuleCheck = (item) => {
    const flagKey = MODULE_FLAG_MAP[item.href];
    if (!flagKey) return true;
    return !!modules?.[flagKey];
  };

  // One flat list, in the order the system is used: collect, store, reward, sell, account for, report.
  const navItems = [
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/dashboard",
      solidIcon: HomeIcon,
    },
    {
      icon: ResidentsIcon,
      label: "Residents",
      href: "/residents",
      solidIcon: UserIcon,
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
      icon: RedemptionProgramIcon,
      label: "Redemption",
      href: "/redemption",
      solidIcon: GiftIcon,
    },
    {
      icon: RewardsIcon,
      label: "Rewards",
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
      icon: MaterialStockIcon,
      label: "MRF Inventory",
      href: "/mrf-inventory",
      solidIcon: CubeIcon,
    },
    {
      icon: ProgramFundsIcon,
      label: "Program Funds",
      href: "/program-funds",
      solidIcon: WalletIcon,
    },
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
  ];

  const settingsItem = {
    icon: SettingsIcon,
    label: "Settings",
    href: "/settings",
    solidIcon: Cog6ToothIcon,
  };

  const canSee = (item) => {
    const matchedEntry = ROLE_MATRIX.find((entry) => item.href === entry.route);
    return matchedEntry?.roles?.includes(role) && passesModuleCheck(item);
  };

  const filteredNavItems = navItems.filter(canSee);

  const renderNavItem = (item) => (
    <Link
      className={`flex flex-row gap-3.5 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-accent/10 transition-all ease-in-out items-center group ${pathName.startsWith(item.href) ? "gradient-button" : ""}`}
      key={item.label}
      href={item.href}
    >
      {pathName.startsWith(item.href) ? (
        <item.solidIcon className="h-4 w-4 md:block hidden" />
      ) : (
        <item.icon className="h-4 w-4 md:block hidden hover:cursor-pointer stroke-text-secondary group-hover:stroke-accent " />
      )}

      <label
        className={`text-base hover:cursor-pointer  ${pathName.startsWith(item.href) ? "text-surface" : "text-text-secondary group-hover:text-accent"}`}
      >
        {item.label}
      </label>
    </Link>
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

      localStorage.removeItem("ecoaidBarangaySession")
      router.push("/barangay/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside
      className={`w-60 md:w-65 h-svh flex flex-col bg-surface fixed top-0 text-white left-0 z-50 ${inter.className} overflow-hidden sidebar new-border`}
    >
      <div className="md:hidden flex pt-4 pr-4 items-end w-full justify-end">
        <XMarkIcon
          className="w-6 h-6  hover:cursor-pointer stroke-text-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="p-4 flex flex-col md:gap-4 gap-8 lg:gap-9 flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-start gap-2 border-b-border border pb-4">
            <Logo />
            <div className="flex flex-col gap-0">
              <p className="font-baloo text-xl text-dark font-medium leading-none">
                ecoaid
              </p>
              <p className="text-text-secondary text-xs">
                Recycling Management
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-text-primary font-medium">
              {user ? `${user.firstName} ${user.lastName}` : " "}
            </p>
            {role && (
              <p className="text-xs text-gray-400 capitalize">
                {role.toLowerCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:gap-3">
          {filteredNavItems.map(renderNavItem)}
        </div>
      </div>
      <div className="shrink-0 bg-surface p-4 pb-15 flex flex-col gap-2 lg:gap-3">
        {canSee(settingsItem) && renderNavItem(settingsItem)}
        <button className="w-full text-left" onClick={handleLogout}>
          <div className="flex flex-row gap-3.5 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-accent/10 transition-all ease-in-out items-center group">
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
