"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GripVertical, Edit, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  active: boolean;
  count: number;
  children: { id: string; name: string; slug: string; active: boolean; count: number }[];
}

const emptyForm = { parentId: "", name: "", icon: "" };

export function AdminCategoriesClient({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCategory() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Failed to create category");
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

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete category");
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Categories</h1>

        <button
          onClick={() => { setError(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-sm font-medium text-gray-500">
          <div className="flex-1">Category Name</div>
          <div className="w-32 text-center">Listings</div>
          <div className="w-24 text-center">Status</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="group">
              <div className="flex items-center p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500" />
                  <span className="text-xl">{cat.icon || "📦"}</span>
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">/{cat.slug}</div>
                </div>
                <div className="w-32 text-center text-sm font-medium text-gray-900">{cat.count}</div>
                <div className="w-24 flex justify-center">
                  <div className={cn("w-10 h-5 rounded-full relative", cat.active ? "bg-primary" : "bg-gray-300")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white", cat.active ? "left-[22px]" : "left-0.5")}></div>
                  </div>
                </div>
                <div className="w-24 flex justify-end gap-2">
                  <button className="text-gray-400 hover:text-indigo-600 transition" onClick={() => alert("Edit is not wired up yet.")}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button disabled={busy} onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cat.children.length > 0 && (
                <div className="pl-12 bg-gray-50/30 divide-y divide-gray-100">
                  {cat.children.map((child) => (
                    <div key={child.id} className="flex items-center p-3 hover:bg-gray-50/80 transition-colors">
                      <div className="flex-1 flex items-center gap-3 pl-4 border-l-2 border-gray-200">
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500" />
                        <div className="text-sm font-medium text-gray-700">{child.name}</div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">/{child.slug}</div>
                      </div>
                      <div className="w-32 text-center text-sm font-medium text-gray-700">{child.count}</div>
                      <div className="w-24 flex justify-center">
                        <div className={cn("w-10 h-5 rounded-full relative", child.active ? "bg-primary" : "bg-gray-300")}>
                          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white", child.active ? "left-[22px]" : "left-0.5")}></div>
                        </div>
                      </div>
                      <div className="w-24 flex justify-end gap-2">
                        <button className="text-gray-400 hover:text-indigo-600 transition" onClick={() => alert("Edit is not wired up yet.")}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button disabled={busy} onClick={() => deleteCategory(child.id)} className="text-gray-400 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  readOnly
                  placeholder="auto-generated from name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="e.g. 📱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button
                disabled={busy || !form.name.trim()}
                onClick={createCategory}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}