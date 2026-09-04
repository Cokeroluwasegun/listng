import { db } from "@/lib/db";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Markets in Nigeria | ListNG",
  description: "Discover local markets across Nigeria. Find sellers and listings in your state.",
};

export default async function MarketsPage() {
  const states = await db.state.findMany({
    where: {
      cities: {
        some: {
          markets: {
            some: {}
          }
        }
      }
    },
    include: {
      cities: {
        include: {
          _count: {
            select: { markets: true }
          },
          markets: {
            include: {
              _count: {
                select: { listings: true }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const stateStats = states.map(state => {
    let marketCount = 0;
    let listingCount = 0;
    state.cities.forEach(city => {
      marketCount += city._count.markets;
      city.markets.forEach(market => {
        listingCount += market._count.listings;
      });
    });
    return { ...state, marketCount, listingCount };
  });

  return (
    <div className="min-h-screen bg-[var(--muted)] pb-12">
      <div className="bg-[var(--color-primary)] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold">Browse Nigeria&apos;s Markets</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Find everything you need from trusted sellers in local markets across the country.
          </p>
          <div className="max-w-xl mx-auto relative mt-8 text-black">
            <input 
              type="text" 
              placeholder="Search for a market or state..." 
              className="w-full pl-12 pr-4 py-4 rounded-full shadow-lg outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stateStats.map(state => (
            <Link key={state.id} href={`/markets/${state.slug}`} className="block group">
              <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[var(--color-primary)] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                    {state.name}
                  </h2>
                </div>
                <div className="mt-auto space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>Markets</span>
                    <span className="font-semibold text-gray-900">{state.marketCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>Active Listings</span>
                    <span className="font-semibold text-gray-900">{state.listingCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
