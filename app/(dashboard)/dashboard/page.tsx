import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Package, Eye, MessageSquare, Heart, Clock, ArrowRight, Plus } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Mock fetching data. In reality, you'd query the DB here.
  const stats = {
    totalListings: 12,
    activeListings: 8,
    totalViews: 1245,
    unreadMessages: 3,
    savedItems: 15,
  };

  const subscription = {
    name: "Pro Vendor",
    endDate: new Date('2026-08-30T10:30:00Z'), // 15 days from now
    daysRemaining: 15,
    isFree: false
  };

  const recentListings = [
    { id: "1", title: "Honda Accord 2018", status: "ACTIVE", views: 245, createdAt: new Date('2026-08-13T10:30:00Z') },
    { id: "2", title: "MacBook Pro M1", status: "PENDING", views: 0, createdAt: new Date('2026-08-15T05:30:00Z') },
    { id: "3", title: "iPhone 13 Pro Max", status: "SOLD", views: 890, createdAt: new Date('2026-08-05T10:30:00Z') },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session.user.name}</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeListings}</div>
          <p className="text-sm text-gray-500 mt-1">out of {stats.totalListings} total</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            +12% this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Unread Messages</h3>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</div>
          <p className="text-sm text-gray-500 mt-1">Needs attention</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Saved Items</h3>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.savedItems}</div>
          <p className="text-sm text-gray-500 mt-1">In your wishlist</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Col */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/listings/create" className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium">
                <Plus className="w-5 h-5" />
                Add Listing
              </Link>
              <Link href="/markets" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Browse Markets
              </Link>
              <Link href="/messages" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                View Messages
              </Link>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
              <Link href="/dashboard/listings" className="text-sm font-medium text-primary flex items-center hover:underline">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{listing.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {listing.views}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(listing.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Col */}
        <div className="space-y-8">
          {/* Subscription Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="w-24 h-24 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 relative z-10">Subscription</h2>
            
            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-black text-gray-900">{subscription.name}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-gray-500">Renews on {subscription.endDate.toLocaleDateString()}</p>
            </div>

            <div className="space-y-2 mb-6 relative z-10">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-gray-600">Days Remaining</span>
                <span className="text-gray-900">{subscription.daysRemaining} days</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(subscription.daysRemaining / 30) * 100}%` }}
                ></div>
              </div>
            </div>

            {subscription.isFree && (
              <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors relative z-10">
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
