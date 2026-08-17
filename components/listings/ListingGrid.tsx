import ListingCard, { ListingCardProps } from "./ListingCard";

export type { ListingCardProps };

interface ListingGridProps {
  listings: ListingCardProps['listing'][];
}

export default function ListingGrid({ listings }: ListingGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
          📭
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-500 max-w-md">
          We couldn&apos;t find any items matching your criteria. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
