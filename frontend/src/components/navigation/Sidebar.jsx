import { formatFullName } from "@/lib/formatFullName";
import {
  HomeIcon,
  InboxStackIcon,
  UserIcon,
  MegaphoneIcon,
  CubeIcon,
  BanknotesIcon,
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
  // Only holds groups the user has toggled by hand; the rest follow the active page.
  const [openGroups, setOpenGroups] = useState({});

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

  // Standalone key modules stay one tap away. The rest sit under group headings.
  const dashboard = {
    icon: DashboardIcon,
    label: "Dashboard",
    href: "/dashboard",
    solidIcon: HomeIcon,
  };
  const residents = {
    icon: ResidentsIcon,
    label: "Residents",
    href: "/residents",
    solidIcon: UserIcon,
  };
  const collectionRequests = {
    icon: RequestIcon,
    label: "Collection Requests",
    href: "/collection-requests",
    solidIcon: InboxStackIcon,
  };
  const redemption = {
    icon: RedemptionProgramIcon,
    label: "Redemption",
    href: "/redemption",
    solidIcon: GiftIcon,
  };
  // Standalone position, group-style heading. Expands to one subitem per
  // report section (one page each). href is only used for the role check.
  const reports = {
    label: "Reports",
    href: "/reports",
    subItems: [
      { label: "Material Inventory", href: "/reports/material-inventory" },
      { label: "Collection & Intake", href: "/reports/collection-intake" },
      { label: "Redemption & Rewards", href: "/reports/redemption-rewards" },
      { label: "Program Funds", href: "/reports/program-funds" },
    ],
  };

  const navLayout = [
    dashboard,
    residents,
    collectionRequests,
    redemption,
    reports,
    {
      title: "Materials",
      items: [
        {
          icon: CollectionSortingIcon,
          label: "Manual Intake",
          href: "/manual-intake",
          solidIcon: ArrowsRightLeftIcon,
        },
        {
          icon: MaterialStockIcon,
          label: "Inventory",
          href: "/mrf-inventory",
          solidIcon: CubeIcon,
        },
      ],
    },
    {
      title: "Finance",
      items: [
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
      ],
    },
    {
      title: "Community",
      items: [
        {
          icon: RewardsIcon,
          label: "Rewards",
          href: "/reward-inventory",
          solidIcon: ClipboardDocumentCheckIcon,
        },
        {
          icon: LeaderboardIcon,
          label: "Leaderboard",
          href: "/leaderboard",
          solidIcon: TrophyIcon,
        },
        {
          icon: AnnoucementsIcon,
          label: "Announcements",
          href: "/announcements",
          solidIcon: MegaphoneIcon,
        },
      ],
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

  // A group heading only shows if the role can see at least one item inside it.
  const visibleNav = navLayout
    .map((entry) =>
      entry.items ? { ...entry, items: entry.items.filter(canSee) } : entry,
    )
    .filter((entry) => (entry.items ? entry.items.length > 0 : canSee(entry)));

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

  const renderSubItem = (item) => {
    const isActive = pathName.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-row items-center rounded-xl p-2 px-3 transition-all ease-in-out hover:cursor-pointer hover:bg-accent/10 group ${isActive ? "gradient-button" : ""}`}
      >
        <span
          className={`text-base ${isActive ? "text-surface" : "text-text-secondary group-hover:text-accent"}`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  // Heading + animated list, shared by the three groups and by Reports.
  // Closed by default; a section holding the current page starts open.
  const renderAccordion = (title, hasActiveItem, items) => {
    const isOpen = openGroups[title] ?? hasActiveItem;

    return (
      <div className="flex flex-col" key={title}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={(e) => {
            // On mobile the drawer sits inside a backdrop that closes on click.
            // A heading should only toggle, not close the drawer.
            e.stopPropagation();
            setOpenGroups((prev) => ({ ...prev, [title]: !isOpen }));
          }}
          className="flex w-full flex-row items-center justify-between p-2 text-text-secondary hover:cursor-pointer"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {title}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          {/* invisible while closed keeps hidden links out of the tab order */}
          <div
            className={`overflow-hidden transition-[visibility] duration-300 ${isOpen ? "visible" : "invisible"}`}
          >
            <div className="flex flex-col gap-2 border-l-2 border-white/10 pl-2 lg:gap-3">
              {items}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParent = (parent) =>
    renderAccordion(
      parent.label,
      pathName.startsWith(parent.href),
      parent.subItems.map(renderSubItem),
    );

  const renderGroup = (group) =>
    renderAccordion(
      group.title,
      group.items.some((item) => pathName.startsWith(item.href)),
      group.items.map(renderNavItem),
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
      className={`w-60 md:w-65 h-svh flex flex-col bg-surface fixed top-0 text-white left-0 z-40 ${inter.className} overflow-hidden sidebar new-border`}
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
              {user ? formatFullName(user) : " "}
            </p>
            {role && (
              <p className="text-xs text-gray-400 capitalize">
                {role.toLowerCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:gap-3">
          {visibleNav.map((entry) =>
            entry.items
              ? renderGroup(entry)
              : entry.subItems
                ? renderParent(entry)
                : renderNavItem(entry),
          )}
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
