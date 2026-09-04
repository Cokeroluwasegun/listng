export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Search, Filter } from "lucide-react";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      market: { select: { name: true } },
      _count: { select: { listings: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    market: u.market?.name ?? null,
    listings: u._count.listings,
    joined: u.createdAt,
    suspended: u.isSuspended,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Users</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Market</th>
                <th className="px-6 py-3 font-medium">Listings</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      user.role === "VENDOR" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.market ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{user.listings}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatTimeAgo(user.joined)}</td>
                  <td className="px-6 py-4">
                    {user.suspended ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Suspended</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AdminUserActions userId={user.id} suspended={user.suspended} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}