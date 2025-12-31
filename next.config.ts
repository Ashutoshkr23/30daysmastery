import type { NextConfig } from "next";

// PWA: Disabled temporarily due to compatibility issues with Next.js 15
/*
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});
*/

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Checks enabled for production quality
};

export default nextConfig;
