export function TableSkeleton() {
  return (
    <div className="p-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="divide-y">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          {/* Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 p-4 rounded-md border">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-2.5 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}