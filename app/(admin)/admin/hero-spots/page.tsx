import { db } from "@/lib/db";
import { formatTimeAgo, cn } from "@/lib/utils";
import Link from "next/link";
import { AdminHeroSpotActions } from "@/components/admin/AdminHeroSpotActions";

export default async function AdminHeroSpotsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const currentTab = typeof searchParams.status === "string" ? searchParams.status : "pending";

  const tabs = [
    { name: "Pending", value: "pending" },
    { name: "Active", value: "active" },
    { name: "Rejected", value: "rejected" },
    { name: "Expired", value: "expired" },
  ];

  const now = new Date();
  const spots = await db.marketHeroSpot.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      market: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const rows = spots
    .filter((s) => {
      switch (currentTab) {
        case "active":
          return s.isApproved && !s.rejectedAt && s.endDate >= now;
        case "rejected":
          return !!s.rejectedAt;
        case "expired":
          return s.isApproved && !s.rejectedAt && s.endDate < now;
        default:
          return !s.isApproved && !s.rejectedAt;
      }
    })
    .map((s) => ({
      id: s.id,
      market: s.market.name,
      seller: s.user.name,
      type: s.spotType,
      title: s.title,
      status: s.isApproved ? "ACTIVE" : s.rejectedAt ? "REJECTED" : "PENDING",
      endDate: s.endDate,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hero Spots Approvals</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/admin/hero-spots?status=${tab.value}`}
                className={cn(
                  "py-4 text-sm font-medium border-b-2 transition-colors",
                  currentTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Market</th>
                <th className="px-6 py-3 font-medium">Seller</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ends</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((spot) => (
                <tr key={spot.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{spot.market}</td>
                  <td className="px-6 py-4 text-gray-600">{spot.seller}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {spot.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{spot.title}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      spot.status === "ACTIVE" && "bg-emerald-100 text-emerald-700",
                      spot.status === "PENDING" && "bg-amber-100 text-amber-700",
                      spot.status === "REJECTED" && "bg-red-100 text-red-700",
                    )}>
                      {spot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatTimeAgo(spot.endDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <AdminHeroSpotActions spotId={spot.id} status={spot.status} />
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