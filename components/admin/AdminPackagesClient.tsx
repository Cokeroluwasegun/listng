"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, CheckCircle2, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export interface AdminPackage {
  id: string;
  name: string;
  tagline: string | null;
  price: number;
  durationDays: number;
  maxListings: number;
  boostFrequencyHours: number;
  heroSpotsPerMonth: number;
  featuredSlotsPerMonth: number;
  isActive: boolean;
  isFree: boolean;
  isPopular: boolean;
  subscribers: number;
}

const emptyForm = {
  name: "",
  tagline: "",
  price: "0",
  durationDays: "30",
  maxListings: "5",
  boostFrequencyHours: "168",
  heroSpotsPerMonth: "0",
  featuredSlotsPerMonth: "0",
  isFree: true,
  isPopular: false,
  isActive: true,
};

export function AdminPackagesClient({ packages }: { packages: AdminPackage[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPackage() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tagline: form.tagline,
          price: form.price,
          durationDays: form.durationDays,
          maxListings: form.maxListings,
          boostFrequencyHours: form.boostFrequencyHours,
          heroSpotsPerMonth: form.heroSpotsPerMonth,
          featuredSlotsPerMonth: form.featuredSlotsPerMonth,
          isFree: form.isFree,
          isPopular: form.isPopular,
          isActive: form.isActive,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Failed to create package");
        return;
      }
      setIsModalOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function deletePackage(id: string, subscribers: number) {
    if (subscribers > 0) {
      alert("This package has active subscribers and cannot be deleted.");
      return;
    }
    if (!confirm("Delete this package permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete package");
      }
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription Packages</h1>

        <button
          onClick={() => { setError(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={cn(
            "bg-white rounded-xl border relative shadow-sm flex flex-col",
            pkg.isPopular ? "border-primary" : "border-gray-200"
          )}>
            {pkg.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="p-6 border-b border-gray-100 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                  pkg.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                )}>
                  {pkg.isActive ? (pkg.isFree ? "Free" : "Paid") : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{pkg.tagline || "—"}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">{pkg.price === 0 ? "Free" : formatPrice(pkg.price)}</span>
                {pkg.price > 0 && <span className="text-gray-500 text-sm">/{pkg.durationDays}d</span>}
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {pkg.maxListings === -1 ? "Unlimited listings" : `${pkg.maxListings} active listings limit`}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {pkg.boostFrequencyHours > 0 ? `Auto-boost every ${pkg.boostFrequencyHours}h` : "No auto-boost"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {pkg.heroSpotsPerMonth} Hero Spots included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {pkg.featuredSlotsPerMonth === -1 ? "Unlimited" : pkg.featuredSlotsPerMonth} Featured Slots included
                </li>
                {pkg.subscribers > 0 && (
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    {pkg.subscribers} active subscriber{pkg.subscribers === 1 ? "" : "s"}
                  </li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex gap-2">
              <button
                disabled={busy}
                onClick={() => alert("Edit is not wired up yet — delete and re-create to change a package.")}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition flex justify-center items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                disabled={busy}
                onClick={() => deletePackage(pkg.id, pkg.subscribers)}
                className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 transition flex justify-center items-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create Package</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="p-5 overflow-y-auto grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Listings (-1 for unlim)</label>
                <input
                  type="number"
                  value={form.maxListings}
                  onChange={(e) => setForm((f) => ({ ...f, maxListings: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Boost Freq (Hours)</label>
                <input
                  type="number"
                  value={form.boostFrequencyHours}
                  onChange={(e) => setForm((f) => ({ ...f, boostFrequencyHours: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Spots / Month</label>
                <input
                  type="number"
                  value={form.heroSpotsPerMonth}
                  onChange={(e) => setForm((f) => ({ ...f, heroSpotsPerMonth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Slots / Month</label>
                <input
                  type="number"
                  value={form.featuredSlotsPerMonth}
                  onChange={(e) => setForm((f) => ({ ...f, featuredSlotsPerMonth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="col-span-2 flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked, price: e.target.checked ? "0" : f.price }))}
                    className="rounded text-primary focus:ring-primary/20"
                  />
                  Free package
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary/20"
                  />
                  Mark as Popular
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary/20"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                disabled={busy || !form.name.trim()}
                onClick={createPackage}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}