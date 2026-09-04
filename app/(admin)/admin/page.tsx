import React from 'react';
import { Users, Package, CreditCard, Clock, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatPrice, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // Mock data for the dashboard since we don't have the full schema
  const stats = {
    users: 12543,
    usersTrend: 342,
    activeListings: 45021,
    pendingListings: 124,
    revenue: 4520500, // in Naira
    pendingHeroSpots: 12,
  };

  const recentActivity = [
    { id: 1, type: 'user', desc: 'New vendor registered: TechWorld', time: new Date('2026-08-15T10:55:00Z') },
    { id: 2, type: 'listing', desc: 'New listing pending: iPhone 14 Pro Max', time: new Date('2026-08-15T10:35:00Z') },
    { id: 3, type: 'payment', desc: 'Subscription purchased: Premium Plan', time: new Date('2026-08-15T08:30:00Z') },
    { id: 4, type: 'report', desc: 'Report filed against listing #8832', time: new Date('2026-08-15T05:30:00Z') },
  ];

  const topMarkets = [
    { name: 'Computer Village', city: 'Ikeja', count: 1245 },
    { name: 'Alaba International', city: 'Ojo', count: 980 },
    { name: 'Trade Fair', city: 'Ojo', count: 850 },
    { name: 'Wuse Market', city: 'Abuja', count: 620 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/listings?status=pending" className="px-4 py-2 text-sm font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition">
            View Pending Listings
          </Link>
          <Link href="/admin/hero-spots?status=pending" className="px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition">
            View Pending Hero Spots
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">{stats.users.toLocaleString()}</div>
            <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.usersTrend} this week
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-3">
            <Package className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium">Listings</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold text-gray-900">{stats.activeListings.toLocaleString()} <span className="text-sm font-normal text-gray-500">active</span></div>
            <div className="text-sm text-amber-600 font-medium">{stats.pendingListings} pending</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-3">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue)}</div>
          <div className="text-xs text-gray-500 mt-1">Sum of successful payments</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">Pending Approvals</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingListings + stats.pendingHeroSpots}</div>
          <div className="text-xs text-gray-500 mt-1">Listings & Hero spots</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts area (Mocked with simple CSS) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Registrations (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 65, 30, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h * 2}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-auto p-5">
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative flex gap-4">
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm text-gray-900 font-medium">{activity.desc}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Markets Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Top Markets by Listing Count</h3>
          <Link href="/admin/markets" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Market Name</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium text-right">Total Listings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topMarkets.map((market, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{market.name}</td>
                  <td className="px-6 py-4 text-gray-600">{market.city}</td>
                  <td className="px-6 py-4 text-right text-gray-900 font-medium">{market.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
