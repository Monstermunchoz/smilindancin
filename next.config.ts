import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: { formats: ["image/webp"], deviceSizes: [384, 640, 828, 1080, 1440, 1920], imageSizes: [64, 96, 160, 256], minimumCacheTTL: 86400, qualities: [70, 75, 80], remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;
