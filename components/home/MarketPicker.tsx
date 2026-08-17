"use client";

import Link from "next/link";

interface Market {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  city: {
    name: string;
    state: {
      name: string;
      slug: string;
    };
  };
  _count: {
    listings: number;
    users: number;
  };
}

export default function MarketPicker({ markets }: { markets: Market[] }) {
  return (
    <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory hide-scrollbar">
        {markets.map((market) => (
          <Link
            key={market.id}
            href={`/markets/${market.city.state.slug}/${market.slug}`}
            className="snap-start shrink-0 w-64 sm:w-auto bg-white rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-gray-100 hover:border-[hsl(var(--color-primary))] hover:shadow-md transition-all duration-300 group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-[hsl(var(--color-primary))] transition-colors line-clamp-1">
                {market.name}
              </h3>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-[hsl(var(--muted))] text-gray-600 rounded-md whitespace-nowrap ml-2">
                {market.specialty}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{market.city.name}, {market.city.state.name}</span>
            </div>
            
            <div className="mt-auto flex items-center justify-between text-sm font-medium text-[hsl(var(--color-secondary))]">
              <span>{market._count.listings.toLocaleString()} Listings</span>
              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs">{market._count.users.toLocaleString()} Sellers</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
