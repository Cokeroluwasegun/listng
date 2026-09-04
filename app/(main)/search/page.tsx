import { db } from "@/lib/db";
import { FilterPanel } from "@/components/FilterPanel";
import ListingGrid from "@/components/listings/ListingGrid";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Search Results | ListNG",
  description: "Search for listings on ListNG marketplace."
};

export default async function SearchPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams: Record<string, unknown> = await props.searchParams as Record<string, unknown>;
  
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const state = typeof searchParams.state === 'string' ? searchParams.state : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const condition = typeof searchParams.condition === 'string' ? searchParams.condition : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseInt(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseInt(searchParams.maxPrice) : undefined;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const take = 20;
  const skip = (page - 1) * take;

  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' };
  
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (state) {
    where.market = { city: { state: { slug: state } } };
  }
  if (category) {
    where.category = { slug: category };
  }
  if (condition) {
    where.condition = condition as Prisma.ListingWhereInput['condition'];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'most_viewed') orderBy = { views: 'desc' };

  const [listings, totalCount] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
        market: { select: { name: true, slug: true, city: { select: { name: true, state: { select: { slug: true } } } } } },
        category: { select: { name: true, slug: true } },
      }
    }).then(listings => listings.map(l => ({ ...l, price: l.price.toNumber() }))),
    db.listing.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return (
    <div className="min-h-screen bg-[var(--muted)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* SIDEBAR */}
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-lg font-display font-bold">
                <SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" />
                Filters
              </div>
              <FilterPanel initialValues={{ q, state, category, condition, minPrice, maxPrice, sort }} />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {q ? `Search results for "${q}"` : 'All Listings'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Found {totalCount} result{totalCount !== 1 && 's'}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 font-medium">Sort by:</label>
                <select 
                  className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  defaultValue={sort}
                  // Ideally use a client component wrapper for onChange router.push
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="most_viewed">Most Viewed</option>
                </select>
              </div>
            </div>

            {listings.length > 0 ? (
              <>
                <ListingGrid listings={listings} />
                
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {page > 1 && (
                      <a href={`?${new URLSearchParams({ ...(searchParams as Record<string, unknown>), page: (page-1).toString() }).toString()}`} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm">
                        Previous
                      </a>
                    )}
                    <span className="text-sm font-medium text-gray-600 px-4 py-2">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <a href={`?${new URLSearchParams({ ...(searchParams as Record<string, unknown>), page: (page+1).toString() }).toString()}`} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-orange-50 font-medium text-sm">
                        Next
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  We couldn&apos;t find any listings matching your current filters. Try removing some filters or searching with different keywords.
                </p>
                <a href="/search" className="inline-flex bg-[var(--color-primary)] text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                  Clear all filters
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
