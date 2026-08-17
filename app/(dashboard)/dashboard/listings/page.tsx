import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice, formatTimeAgo, cn } from "@/lib/utils";
import { Search, Plus, MoreVertical, Edit2, CheckCircle, Power, Trash2, Eye, Package } from "lucide-react";

export default async function DashboardListingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Real DB fetch
  const [rows, subscription] = await Promise.all([
    db.listing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    db.userSubscription.findUnique({
      where: { userId: session.user.id },
      include: { package: true },
    }),
  ]);

  const listings = rows.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category.name,
    price: l.price.toNumber(),
    status: l.status,
    views: l.views,
    createdAt: l.createdAt,
    image: l.images[0] || "",
  }));

  const maxSlots = subscription?.package.maxListings ?? 0;
  const usedSlots = subscription?.listingsUsed ?? 0;

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    SOLD: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">Manage all your products and services</p>
        </div>
        <Link 
          href="/listings/create" 
          className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Listing
        </Link>
      </div>

      {/* Usage Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-medium text-gray-700">Listing Slots</span>
          <span className="text-gray-500">You&apos;ve used {usedSlots} of {maxSlots} listing slots</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${Math.min((usedSlots / maxSlots) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 -mb-2 space-x-2">
        {['All', 'Active', 'Pending', 'Inactive', 'Sold', 'Rejected'].map((filter, i) => (
          <button 
            key={filter}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              i === 0 ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
          <p className="text-gray-500 mb-6">You haven&apos;t posted any listings yet. Start selling today!</p>
          <Link 
            href="/listings/create" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-semibold">
                <tr>
                  <th className="px-6 py-4">Listing</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px] lg:max-w-xs">{listing.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{listing.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(listing.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", statusColors[listing.status] || statusColors.INACTIVE)}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Eye className="w-4 h-4" />
                        {listing.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatTimeAgo(listing.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="Edit" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button title="Mark as Sold" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button title="Deactivate" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <Power className="w-4 h-4" />
                        </button>
                        <button title="Delete" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {listings.map((listing) => (
              <div key={listing.id} className="p-4 flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 truncate pr-2">{listing.title}</h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 mb-2">{formatPrice(listing.price)}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", statusColors[listing.status] || statusColors.INACTIVE)}>
                      {listing.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {listing.views}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatTimeAgo(listing.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
