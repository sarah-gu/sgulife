// Web analytics for the whole site (pageviews and clicks), sent to PostHog through this site's
// own /ingest path so ad blockers are less likely to drop it. Optional: without the token the
// site runs the same and sends nothing.
import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    person_profiles: "identified_only", // visitors stay anonymous
  });
} else if (process.env.NODE_ENV !== "production") {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
  );
}
