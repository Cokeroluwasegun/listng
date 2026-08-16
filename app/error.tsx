"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-6xl font-bold text-primary/20">!</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Something broke</h2>
        <p className="mb-6 text-sm text-gray-600">
          An error occurred on this page. It has been logged and we will investigate.
        </p>
        {error.digest && (
          <p className="mb-4 rounded bg-gray-100 px-3 py-2 text-xs font-mono text-gray-500 break-all text-left">
            {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
