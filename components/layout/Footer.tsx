import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  },
  {
    label: "X (Twitter)",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

const FOOTER_LINKS = {
  "Quick Links": [
    { label: "Browse Markets", href: "/markets" },
    { label: "All Categories", href: "/categories" },
    { label: "Search Listings", href: "/search" },
    { label: "Post an Ad", href: "/listings/create" },
    { label: "Pricing Plans", href: "/pricing" },
  ],
  "Sellers": [
    { label: "Register as Vendor", href: "/register?type=vendor" },
    { label: "Seller Packages", href: "/pricing" },
    { label: "CAC Verification", href: "/register?type=vendor#cac" },
    { label: "Seller Dashboard", href: "/dashboard" },
    { label: "Market Hero Spots", href: "/dashboard/hero-spots" },
  ],
  "Support": [
    { label: "Help Center", href: "/help" },
    { label: "Safety Tips", href: "/safety" },
    { label: "Report a Problem", href: "/report" },
    { label: "Contact Us", href: "/contact" },
    { label: "Advertise", href: "/advertise" },
  ],
  "Legal": [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
};

const TOP_MARKETS = [
  { label: "Computer Village, Lagos", href: "/markets/lagos/computer-village" },
  { label: "Balogun Market, Lagos", href: "/markets/lagos/balogun-market" },
  { label: "Wuse Market, Abuja", href: "/markets/fct-abuja/wuse-market" },
  { label: "Kantin Kwari, Kano", href: "/markets/kano/kantin-kwari-market" },
  { label: "Onitsha Main Market", href: "/markets/anambra/onitsha-main-market" },
  { label: "Ladipo Market, Lagos", href: "/markets/lagos/ladipo-market" },
  { label: "Bodija Market, Ibadan", href: "/markets/oyo/bodija-market" },
  { label: "Mile 1 Market, PH", href: "/markets/rivers/mile-1-market" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(220,15%,9%)] text-[hsl(var(--muted-foreground))]">
      {/* Top Markets Strip */}
      <div className="border-b border-white/10 bg-[hsl(220,15%,7%)]">
        <div className="section py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
              <MapPin className="h-3.5 w-3.5" /> Top Markets:
            </span>
            {TOP_MARKETS.map((market) => (
              <Link
                key={market.href}
                href={market.href}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50 transition-colors hover:border-[hsl(var(--color-primary)/0.5)] hover:text-[hsl(var(--color-primary))]"
              >
                {market.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
                <span className="text-lg font-black text-white">L</span>
              </div>
              <span className="font-display text-xl font-bold text-white">
                List<span className="text-[hsl(var(--color-primary))]">NG</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Nigeria&apos;s premier marketplace connecting buyers and sellers across
              physical markets. Trade safely with verified vendors nationwide.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-white/40">
              <a href="tel:+2348000000000" className="flex items-center gap-2 hover:text-white/70">
                <Phone className="h-3.5 w-3.5" /> +234 800 000 0000
              </a>
              <a href="mailto:support@listng.com.ng" className="flex items-center gap-2 hover:text-white/70">
                <Mail className="h-3.5 w-3.5" /> support@listng.com.ng
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ListNG. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            🇳🇬 Made in Nigeria, for Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
