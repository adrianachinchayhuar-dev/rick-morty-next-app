import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rickandmortyapi.com",
        pathname: "/api/character/avatar/**",
      },
    ],
  },

  experimental: {
    agentFeedback: true,
  },

  // cacheComponents: true,

  // partialPrefetching: true,
};

export default nextConfig;
