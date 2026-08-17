"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldBan, ShieldCheck } from "lucide-react";

interface AdminUserActionsProps {
  userId: string;
  suspended: boolean;
}

export function AdminUserActions({ userId, suspended }: AdminUserActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const reason = suspended ? undefined : prompt("Reason for suspension (optional):") ?? undefined;
    if (suspended === false && reason === undefined) return; // cancelled prompt

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: suspended ? "unsuspend" : "suspend",
          reason,
        }),
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
    <button
      disabled={busy}
      onClick={toggle}
      className={cnBtn(suspended)}
      title={suspended ? "Unsuspend user" : "Suspend user"}
    >
      {suspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
    </button>
  );
}

function cnBtn(suspended: boolean) {
  return suspended
    ? "p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition disabled:opacity-50"
    : "p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50";
}