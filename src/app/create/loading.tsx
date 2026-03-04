export default function CreateLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Mode toggle skeleton */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Slot machine skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-card">
                <div className="h-6 w-20 bg-gray-200 rounded-full mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Generate button skeleton */}
          <div className="h-16 w-full max-w-md mx-auto bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
