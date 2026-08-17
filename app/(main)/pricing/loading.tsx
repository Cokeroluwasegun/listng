export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="mt-6 h-8 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
