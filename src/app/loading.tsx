export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin-slow text-6xl mb-4">🎨</div>
        <p className="font-body text-gray-600 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
