import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Store, 
  MapPin, 
  Grid, 
  Star, 
  CreditCard, 
  Flag, 
  Settings, 
  Bell, 
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
// Removed unused cn import - was causing lint error
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Get some basic counts for badges
  const pendingListingsCount = await db.listing.count({ where: { status: 'PENDING' } }).catch(() => 0);
  const pendingHeroSpotsCount = await db.marketHeroSpot.count({ where: { isApproved: false } }).catch(() => 0);
  const pendingReportsCount = await db.report.count({ where: { status: 'PENDING' } }).catch(() => 0);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Listings', href: '/admin/listings', icon: Package, badge: pendingListingsCount },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Vendors', href: '/admin/vendors', icon: Store },
    { name: 'Markets', href: '/admin/markets', icon: MapPin },
    { name: 'Categories', href: '/admin/categories', icon: Grid },
    { name: 'Hero Spots', href: '/admin/hero-spots', icon: Star, badge: pendingHeroSpotsCount },
    { name: 'Packages', href: '/admin/packages', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: Flag, badge: pendingReportsCount },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#111827] text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-primary">ListNG</span>
            <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  {item.name}
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {session.user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <SignOutButton
            label="Logout"
            className="w-full items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex-1">
            {/* Breadcrumbs or Page Title could go here based on pathname */}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
