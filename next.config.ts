import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3gconf713rknt.cloudfront.net",
      },
    ],
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
