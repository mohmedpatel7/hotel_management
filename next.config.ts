import type { NextConfig } from "next";
// @ts-expect-error withPWA lacks type declarations
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // ⬅ REQUIRED to silence Turbopack
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
