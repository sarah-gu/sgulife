import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false, // don't let `next dev` write an AGENTS.md into the repo
  async headers() {
    // The texting page: never framed by another site, no referrer leakage, no content sniffing,
    // and no access to camera, microphone or location.
    const twin = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      { source: "/twin", headers: twin },
      { source: "/", has: [{ type: "host", value: "twin.sgu.life" }], headers: twin },
    ];
  },
  async rewrites() {
    return {
      // twin.sgu.life serves the texting twin at its root.
      beforeFiles: [{ source: "/", has: [{ type: "host", value: "twin.sgu.life" }], destination: "/twin" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
