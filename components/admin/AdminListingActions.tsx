"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Star, Trash2 } from "lucide-react";

interface AdminListingActionsProps {
  listingId: string;
  status: string;
  featured: boolean;
}

export function AdminListingActions({ listingId, status, featured }: AdminListingActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(path: string, method: "POST" | "PATCH" | "DELETE" = "POST", body?: object) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Action failed");
      }
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "PENDING" && (
        <>
          <button
            disabled={busy}
            onClick={() => call(`/api/admin/listings/${listingId}/approve`)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition disabled:opacity-50"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            disabled={busy}
            onClick={() => call(`/api/admin/listings/${listingId}/reject`)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        disabled={busy}
        onClick={() => call(`/api/admin/listings/${listingId}`, "PATCH", { featured: !featured })}
        className={featured
          ? "p-1.5 text-amber-500 hover:bg-amber-50 rounded transition disabled:opacity-50"
          : "p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition disabled:opacity-50"}
        title={featured ? "Unfeature" : "Feature"}
      >
        <Star className={featured ? "w-4 h-4 fill-amber-500" : "w-4 h-4"} />
      </button>
      <button
        disabled={busy}
        onClick={() => {
          if (confirm("Delete this listing permanently?")) {
            call(`/api/admin/listings/${listingId}`, "DELETE");
          }
        }}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}