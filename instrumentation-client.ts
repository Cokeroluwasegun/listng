// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
const TRACES_SAMPLE_RATE = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.05");
const IS_PROD = process.env.NODE_ENV === "production";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: TRACES_SAMPLE_RATE,
    enabled: IS_PROD,
    environment: process.env.NODE_ENV,
    // Session replay: capture on error only (cheaper than full session)
    replaysOnErrorSampleRate: IS_PROD ? 0.05 : 0,
    replaysSessionSampleRate: 0,
    // Don't send PII
    sendDefaultPii: false,
    // Strip query params that may contain tokens
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          const SENSITIVE = ["token", "secret", "key", "signature", "ref", "code"];
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
  });
}
