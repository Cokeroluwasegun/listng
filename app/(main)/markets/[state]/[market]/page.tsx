import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Package } from "lucide-react";
import { Metadata } from "next";
import ListingGrid from "@/components/listings/ListingGrid";

export async function generateMetadata(props: { params: Promise<{ state: string, market: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Buy & Sell in ${params.market} | ListNG`,
    description: `Shop from verified sellers in ${params.market}, ${params.state}.`
  };
}

export default async function MarketDetailPage(props: { params: Promise<{ state: string, market: string }> }) {
  const params = await props.params;
  const market = await db.market.findFirst({
    where: { 
      slug: params.market,
      city: {
        state: { slug: params.state }
      }
    },
    include: {
      city: { include: { state: true } },
      _count: { select: { listings: true, users: true } }
    }
  });

  if (!market) notFound();

  const now = new Date();
  const heroSpots = await db.marketHeroSpot.findMany({
    where: {
      marketId: market.id,
      isApproved: true,
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });

  const mainBanner = heroSpots.find(s => s.spotType === 'MAIN_BANNER');
  const offerCards = heroSpots.filter(s => s.spotType === 'OFFER_CARD').slice(0, 3);

  const recentListings = await db.listing.findMany({
    where: { marketId: market.id, status: 'ACTIVE' },
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
      market: { select: { name: true, slug: true, city: { select: { name: true, state: { select: { slug: true } } } } } },
      category: { select: { name: true, slug: true } },
    }
  }).then(listings => listings.map(l => ({ ...l, price: l.price.toNumber() })));

  return (
    <div className="min-h-screen bg-[var(--muted)] pb-16">
      {/* HERO SECTION */}
      <div className="relative bg-gray-900 text-white pt-16 pb-24 overflow-hidden">
        {market.heroImage ? (
          <Image 
            src={market.heroImage} 
            alt={market.name} 
            fill 
            className="object-cover opacity-40 mix-blend-overlay"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-80" />
        )}
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <Link href={`/markets/${market.city.state.slug}`} className="inline-flex items-center text-gray-300 hover:text-white text-sm mb-6">
            &larr; Back to {market.city.state.name}
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
                  {market.city.name}, {market.city.state.name}
                </span>
                {market.specialty && (
                  <span className="bg-[var(--color-secondary)] px-3 py-1 rounded-full text-sm font-medium">
                    {market.specialty}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">{market.name}</h1>
              {market.description && <p className="text-lg text-gray-200 mb-6">{market.description}</p>}
              
              <div className="flex gap-6 text-sm font-medium">
                <div className="flex flex-col">
                  <span className="text-gray-400">Vendors</span>
                  <span className="text-2xl">{market._count.users}</span>
                </div>
                <div className="w-px bg-gray-600"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Active Listings</span>
                  <span className="text-2xl">{market._count.listings}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-[400px]">
              <div className="relative text-black">
                <input 
                  type="text" 
                  placeholder={`Search in ${market.name}...`} 
                  className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 space-y-12">
        {/* SPONSORED SPOTS */}
        {(mainBanner || offerCards.length > 0) && (
          <div className="space-y-6">
            {mainBanner && (
              <a href={mainBanner.linkUrl || '#'} className="block rounded-2xl overflow-hidden shadow-xl border border-gray-100 group relative bg-white">
                <div className="relative h-48 md:h-64 w-full">
                  {mainBanner.image ? (
                    <Image src={mainBanner.image} alt={mainBanner.title || 'Promoted'} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                    {mainBanner.title && <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{mainBanner.title}</h3>}
                    {mainBanner.subtitle && <p className="text-white/90 max-w-xl">{mainBanner.subtitle}</p>}
                  </div>
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Sponsored
                  </div>
                </div>
              </a>
            )}
            
            {offerCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offerCards.map(offer => (
                  <a key={offer.id} href={offer.linkUrl || '#'} className="block bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group relative">
                    <div className="relative h-32 w-full bg-gray-100">
                      {offer.image && <Image src={offer.image} alt={offer.title || ''} fill className="object-cover" />}
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Ad</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 line-clamp-1">{offer.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{offer.subtitle}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTINGS SECTION */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b">
            <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-[var(--color-primary)]" />
              Recent Listings
            </h2>
            <Link href={`/search?market=${market.slug}`} className="text-[var(--color-primary)] font-medium hover:underline mt-4 md:mt-0">
              View all listings &rarr;
            </Link>
          </div>
          <ListingGrid listings={recentListings} />
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[var(--color-primary)] to-orange-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg">
          <h2 className="text-3xl font-display font-bold mb-4">Are you selling in {market.name}?</h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of vendors on ListNG. Create your digital storefront, upload your products, and reach customers nationwide.
          </p>
          <Link href="/register" className="inline-block bg-white text-[var(--color-primary)] font-bold text-lg px-8 py-4 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all">
            Register as a Vendor
          </Link>
        </section>
      </div>
    </div>
  );
}
