"use client";

import { Inter } from "next/font/google";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { STAFF_ROLES } from "@/lib/staffRoles";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ROLE_STYLES = {
  CAPTAIN: { bg: "#eaf7e3", text: "#14532D" },
  TREASURER: { bg: "#e0edff", text: "#1e40af" },
  SECRETARY: { bg: "#f3e8ff", text: "#6b21a8" },
  COLLECTOR: { bg: "#fef3c7", text: "#92400e" },
  SK: { bg: "#fce7f3", text: "#9d174d" },
};

const TABLE_HEADERS = ["Name", "Role", "Username", "Contact Number"];

const RoleTag = ({ role }) => {
  const roleMeta = STAFF_ROLES.find((r) => r.value === role);
  const style = ROLE_STYLES[role];
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full text-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {roleMeta?.label ?? role}
    </span>
  );
};

export const StaffTable = ({ accounts, isLoading, isError, handleRefetchCount }) => {
  // Every real account gets its own row — never collapsed or hidden,
  // even if multiple accounts share the same role.
  const filledRoleValues = new Set(accounts?.map((a) => a.role));

  // Only roles with zero accounts get a placeholder row.
  const missingRoles = STAFF_ROLES.filter(
    (role) => !filledRoleValues.has(role.value),
  );

  return (
    <Card
      className={`${inter.className} flex flex-col new-border px-8 overflow-x-auto w-full gap-3 items-start shadow-none! rounded-xl!`}
    >
      <table className="w-full text-sm border-collapse text-nowrap">
        <thead style={{ borderBottom: `0.5px solid #e5e7eb` }}>
          <tr>
            {TABLE_HEADERS.map((h) => (
              <th key={h} className="font-medium p-4 text-start text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {isError && (
            <tr className="max-w-md">
              <td className="text-center" colSpan={TABLE_HEADERS.length}>
                <Error
                  handleRefetchCount={handleRefetchCount}
                  subtext={"Unable to load staff accounts. Please try again."}
                  buttonClassName="gradient-button-admin"
                />
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            accounts?.map((account) => (
              <tr key={account.id} className="text-start">
                <td className="p-4">
                  <p className="font-semibold text-text-primary">
                    {account.firstName} {account.lastName}
                  </p>
                </td>
                <td className="p-4">
                  <RoleTag role={account.role} />
                </td>
                <td className="p-4 text-gray-600">{account.username}</td>
                <td className="p-4 text-gray-600">{account.phoneNumber}</td>
              </tr>
            ))}
          {!isLoading &&
            !isError &&
            missingRoles.map((role) => (
              <tr key={role.value} className="text-start bg-gray-50/60">
                <td className="p-4 text-gray-400 italic">
                  No {role.label} assigned yet
                </td>
                <td className="p-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full text-nowrap bg-gray-100 text-gray-400">
                    {role.label}
                  </span>
                </td>
                <td className="p-4 text-gray-300">—</td>
                <td className="p-4 text-gray-300">—</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Card>
  );
};