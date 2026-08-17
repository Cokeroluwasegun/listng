"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2 } from "lucide-react";

interface AdminHeroSpotActionsProps {
  spotId: string;
  status: string;
}

export function AdminHeroSpotActions({ spotId, status }: AdminHeroSpotActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(action: "approve" | "reject" | "delete") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/hero-spots/${spotId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
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
            onClick={() => call("approve")}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition disabled:opacity-50"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            disabled={busy}
            onClick={() => call("reject")}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        disabled={busy}
        onClick={() => {
          if (confirm("Delete this hero spot?")) call("delete");
        }}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}