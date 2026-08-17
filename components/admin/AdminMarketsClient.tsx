"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, MapPin, Edit, Trash2, X } from "lucide-react";

export interface AdminMarket {
  id: string;
  name: string;
  city: string;
  state: string;
  specialty: string | null;
  sellers: number;
  listings: number;
}

const emptyForm = {
  name: "",
  stateName: "Lagos",
  cityName: "",
  description: "",
  specialty: "",
  heroImage: "",
};

export function AdminMarketsClient({ markets }: { markets: AdminMarket[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const states = useMemo(() => {
    const map = new Map<string, AdminMarket[]>();
    for (const m of markets) {
      const list = map.get(m.state) ?? [];
      list.push(m);
      map.set(m.state, list);
    }
    const filtered = query
      ? markets.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
      : markets;
    return Array.from(map.entries()).map(([state, list]) => ({
      state,
      markets: list.filter((m) => !query || m.name.toLowerCase().includes(query.toLowerCase()) || filtered.includes(m)),
    }));
  }, [markets, query]);

  async function createMarket() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Failed to create market");
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

  async function deleteMarket(id: string, sellers: number, listings: number) {
    if (sellers > 0 || listings > 0) {
      alert("This market has sellers or listings and cannot be deleted.");
      return;
    }
    if (!confirm("Delete this market permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/markets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete market");
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Markets</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => { setError(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Market
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {states.map((stateGroup) => (
          <div key={stateGroup.state} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{stateGroup.state}</h2>
            </div>

            {stateGroup.markets.length === 0 ? (
              <p className="px-6 py-6 text-sm text-gray-500">No markets found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Market Name</th>
                      <th className="px-6 py-3 font-medium">City</th>
                      <th className="px-6 py-3 font-medium">Specialty</th>
                      <th className="px-6 py-3 font-medium">Stats</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stateGroup.markets.map((market) => (
                      <tr key={market.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{market.name}</td>
                        <td className="px-6 py-4 text-gray-600">{market.city}</td>
                        <td className="px-6 py-4 text-gray-600 text-xs">{market.specialty || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-900 font-medium">{market.sellers} sellers</div>
                          <div className="text-xs text-gray-500">{market.listings} listings</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                              title="Edit"
                              onClick={() => alert("Edit is not wired up yet.")}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => deleteMarket(market.id, market.sellers, market.listings)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add New Market</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={form.stateName}
                  onChange={(e) => setForm((f) => ({ ...f, stateName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option>Lagos</option>
                  <option>FCT - Abuja</option>
                  <option>Rivers</option>
                  <option>Oyo</option>
                  <option>Anambra</option>
                  <option>Kano</option>
                  <option>Enugu</option>
                  <option>Kaduna</option>
                  <option>Edo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.cityName}
                  onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics, Fashion"
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.heroImage}
                  onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button
                disabled={busy || !form.name.trim() || !form.cityName.trim()}
                onClick={createMarket}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Market"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}