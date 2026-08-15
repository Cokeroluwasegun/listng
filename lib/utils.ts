import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₦0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUsername(name: string): string {
  const base = slugify(name).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${base}${suffix}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateReference(prefix: string = "LST"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function isSubscriptionActive(endDate: Date | string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate) > new Date();
}

export function getVercelGeoHeaders(headers: Headers) {
  return {
    country: headers.get("x-vercel-ip-country") || null,
    city: headers.get("x-vercel-ip-city") || null,
    ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  };
}
