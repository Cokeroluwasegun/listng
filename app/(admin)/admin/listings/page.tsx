import { db } from "@/lib/db";
import { formatPrice, formatTimeAgo, cn } from "@/lib/utils";
import { Search, Filter, Star } from "lucide-react";
import Link from "next/link";
import { AdminListingActions } from "@/components/admin/AdminListingActions";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const currentTab = typeof searchParams.status === "string" ? searchParams.status : "all";

  const statusFilter =
    currentTab === "all" ? undefined : (currentTab.toUpperCase() as "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED");

  const [rows, total] = await Promise.all([
    db.listing.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        seller: { select: { name: true } },
        category: { select: { name: true } },
        market: { select: { name: true } },
      },
    }),
    db.listing.count({ where: statusFilter ? { status: statusFilter } : undefined }),
  ]);

  const listings = rows.map((l) => ({
    id: l.id,
    title: l.title,
    seller: l.seller.name,
    category: l.category.name,
    market: l.market.name,
    price: l.price.toNumber(),
    status: l.status,
    date: l.createdAt,
    featured: l.isFeatured,
  }));

  const tabs = [
    { name: "All", value: "all" },
    { name: "Pending", value: "pending" },
    { name: "Active", value: "active" },
    { name: "Rejected", value: "rejected" },
    { name: "Expired", value: "expired" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Listings</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
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
        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/admin/listings?status=${tab.value}`}
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
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Seller</th>
                <th className="px-6 py-3 font-medium">Category/Market</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  className={cn(
                    "transition-colors",
                    listing.status === "PENDING" ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-gray-50/50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {listing.title}
                      {listing.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{listing.seller}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{listing.category}</div>
                    <div className="text-xs text-gray-500">{listing.market}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(listing.price)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      listing.status === "ACTIVE" && "bg-emerald-100 text-emerald-700",
                      listing.status === "PENDING" && "bg-amber-100 text-amber-700",
                      listing.status === "REJECTED" && "bg-red-100 text-red-700",
                      listing.status === "EXPIRED" && "bg-gray-100 text-gray-700",
                    )}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatTimeAgo(listing.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <AdminListingActions
                      listingId={listing.id}
                      status={listing.status}
                      featured={listing.featured}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {listings.length} of {total} entries</div>
          {total > 100 && <div>Limit of 100 shown per view</div>}
        </div>
      </div>
    </div>
  );
}