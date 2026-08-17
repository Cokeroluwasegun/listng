import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck, Heart, Share2, MessageCircle, PhoneCall, Flag, CheckCircle, Eye, Clock } from "lucide-react";
import { formatPrice, formatTimeAgo, cn } from "@/lib/utils";
import { Metadata } from "next";
import ListingGrid from "@/components/listings/ListingGrid";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const listing = await db.listing.findUnique({ where: { id: params.id } });
  if (!listing) return { title: "Listing Not Found" };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://listng.com.ng";
  return {
    title: `${listing.title} | ListNG`,
    description: listing.description.substring(0, 150) + "...",
    openGraph: {
      type: "website",
      url: `${appUrl}/listings/${params.id}`,
      title: listing.title,
      description: listing.description.substring(0, 150),
      images: listing.images[0] ? [{ url: listing.images[0], width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: listing.description.substring(0, 150),
      images: listing.images[0] ? [listing.images[0]] : [],
    },
  };
}

export default async function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const listing = await db.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        include: {
          vendorProfile: {
            include: { cacVerification: true }
          },
          _count: { select: { listings: true } }
        }
      },
      category: {
        include: { parent: true }
      },
      market: {
        include: {
          city: { include: { state: true } }
        }
      }
    }
  });

  if (!listing || listing.status !== 'ACTIVE') notFound();

  // Fire and forget view increment
  db.listing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } }
  }).catch(console.error);

  const similarListings = await db.listing.findMany({
    where: { 
      categoryId: listing.categoryId,
      id: { not: listing.id },
      status: 'ACTIVE'
    },
    take: 6,
    include: { 
      seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
      market: { select: { name: true, slug: true, city: { select: { name: true, state: { select: { slug: true } } } } } },
      category: { select: { name: true, slug: true } },
    }
  }).then(listings => listings.map(l => ({ ...l, price: l.price.toNumber() })));

  const mainImage = listing.images?.[0] || '/placeholder.png';
  const attributes = Array.isArray(listing.attributes)
    ? (listing.attributes as { name?: string; value?: string }[])
    : [];

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-16 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* BREADCRUMB */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-[hsl(var(--color-primary))]">Home</Link>
          <span>/</span>
          {listing.category?.parent && (
            <>
              <Link href={`/category/${listing.category.parent.slug}`} className="hover:text-[hsl(var(--color-primary))]">
                {listing.category.parent.name}
              </Link>
              <span>/</span>
            </>
          )}
          {listing.category && (
            <Link href={`/category/${listing.category.slug}`} className="hover:text-[hsl(var(--color-primary))]">
              {listing.category.name}
            </Link>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:w-[60%] space-y-6">
            <div className="card bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
                <Image src={mainImage} alt={listing.title} fill className="object-contain" />
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.images.map((img, i) => (
                    <button key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-[hsl(var(--color-primary))] shrink-0">
                      <Image src={img} alt="thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full",
                    listing.condition === 'NEW' ? "bg-green-100 text-green-800" :
                    listing.condition === 'USED' ? "bg-amber-100 text-amber-800" :
                    "bg-blue-100 text-blue-800"
                  )}>
                    {listing.condition}
                  </span>
                  {listing.isNegotiable && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      Negotiable
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-snug">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Posted {formatTimeAgo(listing.createdAt)}
                  </div>
                  {listing.market && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.market.name}, {listing.market.city?.name}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {listing.views} views
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-display font-bold text-lg mb-3">Description</h3>
                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </div>
              </div>

              {attributes.length > 0 && (
                <>
                  <hr className="border-gray-100" />
                  <div>
                    <h3 className="font-display font-bold text-lg mb-3">Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      {attributes.map((attr, idx) => (
                        <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-gray-500">{attr.name}</span>
                          <span className="font-medium text-gray-900">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SAFETY TIPS */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 className="text-red-800 font-bold flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5" /> Safety Tips
              </h3>
              <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                <li>Never pay in advance, even for delivery.</li>
                <li>Meet the seller at a safe public place.</li>
                <li>Inspect the item and ensure it&apos;s exactly what you want.</li>
                <li>Pay only after collecting the item.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-[40%]">
            <div className="sticky top-24 space-y-6">
              {/* PRICE CARD */}
              <div className="card bg-white rounded-2xl p-6 shadow-sm border border-[hsl(var(--color-primary))]/20">
                <div className="mb-6">
                  <div className="text-4xl font-display font-bold text-[hsl(var(--color-primary))]">
                    {formatPrice(listing.price.toNumber())}
                  </div>
                  {listing.isNegotiable && (
                    <div className="text-sm text-gray-500 mt-1">Price is negotiable</div>
                  )}
                </div>

                <div className="space-y-3">
                  <Link href={`/messages?listingId=${listing.id}`} className="flex items-center justify-center w-full bg-[hsl(var(--color-primary))] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                    <MessageCircle className="w-5 h-5 mr-2" /> Send Message
                  </Link>
                  {listing.seller.phone && (
                    <a href={`tel:${listing.seller.phone}`} className="flex items-center justify-center w-full bg-white text-[hsl(var(--color-primary))] border-2 border-[hsl(var(--color-primary))] py-3.5 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                      <PhoneCall className="w-5 h-5 mr-2" /> Show Contact
                    </a>
                  )}
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-red-500 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5" /> Save
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-500 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5" /> Share
                  </button>
                </div>
              </div>

              {/* SELLER CARD */}
              <div className="card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-display font-bold text-lg mb-4">Seller Information</h3>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <Image 
                      src={listing.seller.vendorProfile?.logo || listing.seller.image || '/avatar.png'} 
                      alt={listing.seller.name || 'Seller'} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {listing.seller.vendorProfile?.businessName || listing.seller.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {listing.seller.isFaceVerified && (
                        <span className="inline-flex items-center text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                          <CheckCircle className="w-3 h-3 mr-0.5" /> Identity Verified
                        </span>
                      )}
                      {listing.seller.vendorProfile?.cacVerification?.isVerified && (
                        <span className="inline-flex items-center text-[10px] bg-green-50 text-[hsl(var(--color-secondary))] px-1.5 py-0.5 rounded-full font-bold">
                          <ShieldCheck className="w-3 h-3 mr-0.5" /> CAC Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Joined {new Date(listing.seller.createdAt).getFullYear()} • {listing.seller._count?.listings || 0} Active Ads
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href={`/store/${listing.seller.id}`} className="block w-full text-center bg-gray-50 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors">
                    Visit Storefront
                  </Link>
                </div>
                <div className="mt-4 text-center">
                  <button className="text-xs text-gray-400 hover:text-red-500 flex items-center justify-center w-full gap-1">
                    <Flag className="w-3 h-3" /> Report this listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR LISTINGS */}
        {similarListings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Similar items you may like</h2>
            <ListingGrid listings={similarListings} />
          </div>
        )}
      </div>
    </div>
  );
}
