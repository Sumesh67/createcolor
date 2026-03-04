export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-3xl p-8 shadow-card">
          {/* Logo skeleton */}
          <div className="text-center mb-8">
            <div className="h-12 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-40 bg-gray-200 rounded-full mx-auto animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />

            {/* Role selector skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
            </div>

            <div className="h-12 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Link skeleton */}
          <div className="mt-6 text-center">
            <div className="h-4 w-48 bg-gray-200 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
