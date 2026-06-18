import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No aturem el build per avisos d'ESLint (els revisem a part).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
