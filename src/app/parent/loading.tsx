export default function ParentLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-card">
              <div className="h-6 w-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
              <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Party Pack Builder skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-card mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-full mb-6 animate-pulse" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Print history skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <div className="h-8 w-40 bg-gray-200 rounded-full mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
