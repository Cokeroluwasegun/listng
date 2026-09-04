// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const TRACES_SAMPLE_RATE = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
const PROFILES_SAMPLE_RATE = Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? "0.1");
const IS_PROD = process.env.NODE_ENV === "production";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: TRACES_SAMPLE_RATE,
    profilesSampleRate: PROFILES_SAMPLE_RATE,
    enabled: IS_PROD,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.npm_package_version,
    sendDefaultPii: false,
    // Scrub sensitive data from error events
    beforeSend(event) {
      // Remove IP and email from user context
      if (event.user) {
        const u = event.user as { ip_address?: string; email?: string };
        delete u.ip_address;
        delete u.email;
      }
      // Strip query strings that may contain tokens / secrets
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          const SENSITIVE = ["token", "secret", "key", "signature", "ref"];
          for (const k of [...url.searchParams.keys()]) {
            if (SENSITIVE.some((s) => k.toLowerCase().includes(s))) {
              url.searchParams.set(k, "[redacted]");
            }
          }
          event.request.url = url.toString();
        } catch {
          // ignore invalid URLs
        }
      }
      return event;
    },
    // Drop noisy transactions (e.g. health checks) from performance
    beforeSendTransaction(event) {
      const url = event.request?.url ?? "";
      if (
        url.includes("/api/health") ||
        url.includes("/api/ready") ||
        url.includes("/_next/")
      ) {
        return null;
      }
      return event;
    },
    ignoreErrors: [
      // Network errors that don't matter
      "NetworkError",
      "Failed to fetch",
      // Random browser errors
      "ResizeObserver loop limit exceeded",
      /^chrome-extension:/,
    ],
  });
}
