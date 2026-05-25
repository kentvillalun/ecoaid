import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EcoAid",
  description: "EcoAid is a barangay waste management system that allows residents to contribute recyclable materials and enables the barangay to manage collections, track inventory, run redemption programs, and monitor finances.",
  appleWebApp: {
    title: "EcoAid"
  },
  
};

export const viewport = {
  userScalable: false,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-auto`}
      >
        {children}
      </body>
    </html>
  );
}
