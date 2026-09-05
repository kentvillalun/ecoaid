import {
  HomeIcon,
  BuildingOffice2Icon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import {
  HomeIcon as DashboardIcon,
  BuildingOffice2Icon as BarangayAccountsIcon,
  UsersIcon as StaffManagementIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowLeftStartOnRectangleIcon as LogoutIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AdminDrawerContext } from "@/app/(admin)/layout.jsx";
import Link from "next/link";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "../branding/Logo";
import { toast } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const AdminSidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useContext(AdminDrawerContext);
  const pathName = usePathname();
  const router = useRouter()

  const topLevelItems = [
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/admin-dashboard",
      solidIcon: HomeIcon,
    },
    {
      icon: BarangayAccountsIcon,
      label: "Barangay Accounts",
      href: "/barangay-accounts",
      solidIcon: BuildingOffice2Icon,
    },
    // {
    //   icon: StaffManagementIcon,
    //   label: "Staff Management",
    //   href: "/staff-management",
    //   solidIcon: UsersIcon,
    // },
    {
      icon: SettingsIcon,
      label: "Settings",
      href: "/settings",
      solidIcon: Cog6ToothIcon,
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Logout failed");
        return;
      }

      router.push("/admin/login")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const renderNavItem = (item) => (
    <Link
      className={`flex flex-row gap-3.5 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-admin-accent/10 transition-all ease-in-out items-center group ${pathName.startsWith(item.href) ? "gradient-button-admin" : ""}`}
      key={item.label}
      href={item.href}
    >
      {pathName.startsWith(item.href) ? (
        <item.solidIcon className="h-4 w-4 md:block hidden" />
      ) : (
        <item.icon className="h-4 w-4 md:block hidden hover:cursor-pointer stroke-text-secondary group-hover:stroke-admin-accent " />
      )}

      <label
        className={`text-base hover:cursor-pointer  ${pathName.startsWith(item.href) ? "text-surface" : "text-text-secondary group-hover:text-admin-accent"}`}
      >
        {item.label}
      </label>
    </Link>
  );

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
      <div className="p-4 flex flex-col md:gap-4 gap-8 lg:gap-9">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-start gap-2 border-b-border border pb-4">
            <Logo />
            <div className="flex flex-col gap-0">
              <p className="font-baloo text-xl text-dark font-medium leading-none">
                ecoaid
              </p>
              <p className="text-text-secondary text-xs">Super Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:gap-3">
          {topLevelItems.map(renderNavItem)}
        </div>
      </div>
      <div className="mt-auto">
        <button className="pl-6 p-4 mb-15 w-full">
          <div className="flex flex-row gap-3 hover:cursor-pointer p-2 px-3 rounded-xl hover:bg-admin-accent/10 transition-all ease-in-out items-center group" onClick={handleLogout}>
            <LogoutIcon className="h-4 w-4 md:block hidden hover:cursor-pointer group-hover:stroke-admin-accent stroke-text-secondary" />
            <label className="text-base text-text-secondary hover:cursor-pointer group-hover:text-admin-accent">
              Logout
            </label>
          </div>
        </button>
      </div>
    </aside>
  );
};
