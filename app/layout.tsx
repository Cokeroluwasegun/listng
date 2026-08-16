import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "ListNG — Buy & Sell Across Nigeria's Markets",
    template: "%s | ListNG",
  },
  description:
    "Nigeria's premier marketplace connecting buyers and sellers across physical markets. Find verified vendors in Computer Village, Balogun, Alaba, and 60+ markets nationwide.",
  keywords: [
    "Nigeria marketplace",
    "buy and sell Nigeria",
    "Nigerian market",
    "online market Nigeria",
    "jiji alternative",
    "Lagos market",
    "Abuja market",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "ListNG",
    title: "ListNG — Buy & Sell Across Nigeria's Markets",
    description:
      "Nigeria's premier marketplace. Find verified vendors across 60+ markets nationwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ListNG — Buy & Sell Across Nigeria's Markets",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
