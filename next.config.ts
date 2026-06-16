import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/slash",
  // Don't bundle/trace these heavy server-only deps into the build — leave them as
  // runtime requires. Keeps the build light and avoids OOM/flaky builds on Railway.
  serverExternalPackages: ["playwright-core", "@browserbasehq/sdk"],
};

export default nextConfig;
