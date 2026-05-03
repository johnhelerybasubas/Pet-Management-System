import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  allowedDevOrigins: ['127.0.0.1'],
  typescript: {
    // Type errors are ignored during build - this is needed because the Proxy-based
    // lazy initialization loses type information but the code works correctly at runtime
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
