import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: { formats: ["image/avif", "image/webp"], remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;
