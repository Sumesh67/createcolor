export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-80 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Upload area skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-card border-2 border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="h-16 w-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
              <div className="h-6 w-48 bg-gray-200 rounded-full mb-2 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Preview area skeleton */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-card">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-20 bg-gray-200 rounded-full mx-auto animate-pulse" />
              </div>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-card">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-20 bg-gray-200 rounded-full mx-auto animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
