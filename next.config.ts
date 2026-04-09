import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ldb-phinf.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "search.pstatic.net",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
  async redirects() {
    return [
      {
        source: "/notice/admin",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
