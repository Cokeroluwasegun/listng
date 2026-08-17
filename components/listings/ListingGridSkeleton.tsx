interface ListingGridSkeletonProps {
  count?: number;
}

export default function ListingGridSkeleton({ count = 8 }: ListingGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] border border-gray-100 flex flex-col h-[380px]"
        >
          <div className="relative aspect-square w-full bg-[hsl(var(--muted))] animate-pulse" />
          
          <div className="p-4 flex flex-col flex-grow">
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-full animate-pulse" />
              <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4 animate-pulse" />
            </div>
            
            <div className="h-6 bg-[hsl(var(--muted))] rounded-md w-1/2 mb-4 animate-pulse" />
            
            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-[hsl(var(--muted))] rounded-md w-2/5 animate-pulse" />
                <div className="h-5 bg-[hsl(var(--muted))] rounded-md w-1/4 animate-pulse" />
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 w-1/2">
                  <div className="h-6 w-6 rounded-full bg-[hsl(var(--muted))] animate-pulse shrink-0" />
                  <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-full animate-pulse" />
                </div>
                <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
