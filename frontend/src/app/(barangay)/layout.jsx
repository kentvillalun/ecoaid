import { time } from "motion";
import BarangayLayoutClient from "./BarangayLayoutClient";
import { title } from "motion/react-client";

export const metadata = {
  manifest: "/barangay-manifest.json",
  title: "EcoAid",
  appleWebApp: {
    title: "EcoAid"
  }

}

export default function BarangayLayout({ children }) {
  return <BarangayLayoutClient>{children}</BarangayLayoutClient>;
}
