/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.30"],
  // hides the Next.js "N" badge when capturing demo screenshots (DEMO_CAPTURE=1)
  devIndicators: process.env.DEMO_CAPTURE === "1" ? false : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecoaid-ydrs.onrender.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5001"
        : "https://ecoaid-ydrs.onrender.com"; //  "https://ecoprofit-production.up.railway.app";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
