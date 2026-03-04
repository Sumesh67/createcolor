export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Filter tabs skeleton */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Gallery grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-gray-200 rounded-full mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
