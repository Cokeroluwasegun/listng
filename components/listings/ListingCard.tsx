"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice, formatTimeAgo } from "@/lib/utils";

export interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string;
    images: string[];
    condition: string;
    isNegotiable: boolean;
    isFeatured: boolean;
    isUrgent: boolean;
    createdAt: string | Date;
    seller: {
      id: string;
      name: string;
      image: string | null;
      isFaceVerified: boolean;
    };
    market: {
      name: string;
      slug: string;
      city: {
        name: string;
        state: {
          slug: string;
        };
      };
    };
    category: {
      name: string;
      slug: string;
    };
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : "/placeholder-image.jpg";

  const numericPrice = Number(listing.price);

  return (
    <Link 
      href={`/listings/${listing.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img 
          src={mainImage} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
          {listing.isFeatured && (
            <span className="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          {listing.isUrgent && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              Urgent
            </span>
          )}
        </div>

        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          aria-label="Toggle wishlist"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-500 fill-none'}`} 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={isWishlisted ? 0 : 2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[hsl(var(--color-secondary))] font-semibold text-sm line-clamp-2 leading-tight flex-grow pr-2">
            {listing.title}
          </h3>
        </div>
        
        <div className="font-bold text-lg text-gray-900 mb-3">
          {typeof formatPrice === 'function' ? formatPrice(numericPrice) : `₦${Intl.NumberFormat('en-NG').format(numericPrice)}`}
          {listing.isNegotiable && <span className="text-xs font-normal text-gray-500 ml-1">(Negotiable)</span>}
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md">
              <span className="truncate max-w-[120px]">{listing.market.name}, {listing.market.city.name}</span>
            </div>
            <span className="font-medium bg-[hsl(var(--muted))] px-2 py-1 rounded-md">{listing.condition}</span>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                  {listing.seller.image ? (
                    <img src={listing.seller.image} alt={listing.seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[hsl(var(--color-primary))] text-white flex items-center justify-center text-xs font-bold">
                      {listing.seller.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {listing.seller.isFaceVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-[2px] border border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600 ml-2 truncate max-w-[80px]">{listing.seller.name}</span>
            </div>
            <span className="text-xs text-gray-400">
              {typeof formatTimeAgo === 'function' ? formatTimeAgo(new Date(listing.createdAt)) : new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
