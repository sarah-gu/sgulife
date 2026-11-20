import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false, // don't let `next dev` write an AGENTS.md into the repo
  skipTrailingSlashRedirect: true, // PostHog's API paths end in a slash; don't redirect them
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
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: "twin.sgu.life" }], destination: "/twin" },
        // Analytics goes through this site's own domain and is forwarded to PostHog.
        { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
        { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
        { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
