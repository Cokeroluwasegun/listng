"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Search } from "lucide-react";

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo",
  "Anambra", "Enugu", "Edo", "Kaduna", "Delta",
];

const CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Vehicles", slug: "vehicles" },
  { name: "Real Estate", slug: "real-estate" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Garden", slug: "home-garden" },
  { name: "Agriculture", slug: "agriculture" },
  { name: "Building Materials", slug: "building-materials" },
  { name: "Services", slug: "services" },
  { name: "Jobs", slug: "jobs" },
  { name: "Food & Beverages", slug: "food-beverages" },
];

const CONDITIONS = [
  { name: "New", value: "NEW" },
  { name: "Used", value: "USED" },
  { name: "Refurbished", value: "REFURBISHED" },
];

interface FilterPanelProps {
  initialValues?: {
    q?: string;
    state?: string;
    category?: string;
    condition?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    sort?: string;
  };
}

export function FilterPanel({ initialValues }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(initialValues?.q || "");
  const [state, setState] = useState(initialValues?.state || "");
  const [category, setCategory] = useState(initialValues?.category || "");
  const [condition, setCondition] = useState(initialValues?.condition || "");
  const [minPrice, setMinPrice] = useState(initialValues?.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(initialValues?.maxPrice?.toString() || "");
  const [sort, setSort] = useState(initialValues?.sort || "newest");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort && sort !== "newest") params.set("sort", sort);

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearAll = () => {
    setQ("");
    setState("");
    setCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    router.push(pathname);
  };

  const hasActiveFilters =
    q || state || category || condition || minPrice || maxPrice;

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Keyword
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search listings..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
          />
        </div>
      </div>

      {/* State */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          State
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
        >
          <option value="">All States</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Condition
        </label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
        >
          <option value="">Any Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Price Range (₦)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary),transparent 20%)]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={applyFilters}
          className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}