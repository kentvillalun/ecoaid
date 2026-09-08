import BarangayLayoutClient from "./BarangayLayoutClient";

export const metadata = {
  manifest: "/barangay-manifest.json"
}

export default function BarangayLayout({ children }) {
  return <BarangayLayoutClient>{children}</BarangayLayoutClient>;
}
