// This file configures the initialization of Sentry for edge features.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const TRACES_SAMPLE_RATE = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
const IS_PROD = process.env.NODE_ENV === "production";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: TRACES_SAMPLE_RATE,
    enabled: IS_PROD,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.npm_package_version,
    sendDefaultPii: false,
  });
}
