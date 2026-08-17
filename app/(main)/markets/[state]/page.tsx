import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Store, Tag } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Markets in ${params.state} | ListNG`,
    description: `Discover top markets, sellers, and listings in ${params.state}, Nigeria.`
  };
}

export default async function StateMarketsPage(props: { params: Promise<{ state: string }> }) {
  const params = await props.params;
  const state = await db.state.findUnique({
    where: { slug: params.state },
    include: {
      cities: {
        include: {
          markets: {
            include: {
              _count: {
                select: { listings: true }
              }
            }
          }
        }
      }
    }
  });

  if (!state) notFound();

  let totalMarkets = 0;
  const allMarkets: { 
    id: string; 
    name: string; 
    slug: string; 
    heroImage: string | null; 
    specialty: string | null; 
    cityName: string; 
    _count: { listings: number }
  }[] = [];
  state.cities.forEach(city => {
    totalMarkets += city.markets.length;
    city.markets.forEach(market => {
      allMarkets.push({ ...market, cityName: city.name });
    });
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-12">
      <div className="bg-[hsl(var(--color-primary))] text-white py-12 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/markets" className="inline-flex items-center text-orange-100 hover:text-white text-sm mb-6 transition-colors">
            &larr; Back to all states
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{state.name} Markets</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Explore {totalMarkets} vibrant market{totalMarkets !== 1 ? 's' : ''} across {state.name}. Find local sellers and great deals nearby.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {allMarkets.map(market => (
            <Link key={market.id} href={`/markets/${state.slug}/${market.slug}`} className="block group">
              <div className="card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg h-full flex flex-col">
                <div className="mb-3">
                  <h2 className="font-display font-bold text-lg text-gray-900 group-hover:text-[hsl(var(--color-primary))] transition-colors line-clamp-1">
                    {market.name}
                  </h2>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {market.cityName}, {state.name}
                  </div>
                </div>
                
                {market.specialty && (
                  <div className="mb-4">
                    <span className="badge bg-green-50 text-[hsl(var(--color-secondary))] px-2 py-1 rounded-md text-xs font-medium inline-flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {market.specialty}
                    </span>
                  </div>
                )}
                
                <div className="mt-auto grid grid-cols-2 gap-2 text-xs border-t pt-3">
                  <div className="flex flex-col text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 mb-1">Listings</span>
                    <span className="font-semibold text-gray-900">{market._count.listings}</span>
                  </div>
                  <div className="flex flex-col text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 mb-1">Status</span>
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {allMarkets.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-gray-700">No markets found</h3>
            <p className="text-gray-500 mt-2">We couldn&apos;t find any markets in this state yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
