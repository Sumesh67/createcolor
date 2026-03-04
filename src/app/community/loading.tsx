export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-56 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-72 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-12 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Gallery grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-10 w-full bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
