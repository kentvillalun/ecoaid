import { redirect } from "next/navigation";

// Reports is a parent in the sidebar; each section is its own page.
export default function ReportsPage() {
  redirect("/reports/material-inventory");
}
