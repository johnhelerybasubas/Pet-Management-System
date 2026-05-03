import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
