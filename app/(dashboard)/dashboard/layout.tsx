import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  MessageSquare, 
  BarChart, 
  Star, 
  Settings,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user;
  const isVendor = user.role === "VENDOR";

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Listings", href: "/dashboard/listings", icon: Package },
    { label: "Saved Items", href: "/dashboard/saved", icon: Heart },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    ...(isVendor ? [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart },
      { label: "Hero Spots", href: "/dashboard/hero-spots", icon: Star },
    ] : []),
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            ListNG
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 hover:text-primary transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <SignOutButton
            label="Sign Out"
            className="w-full px-4 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Navigation (Horizontal Scroll) */}
        <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto">
          <nav className="flex px-4 py-3 space-x-4 min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 whitespace-nowrap"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
