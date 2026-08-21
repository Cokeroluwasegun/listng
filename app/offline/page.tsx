export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-7xl select-none">📡</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">You&apos;re offline</h1>
        <p className="mb-6 text-gray-600">
          Check your internet connection. Some features may not be available until you&apos;re back
          online.
        </p>
        <button
          onClick={() => location.reload()}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
