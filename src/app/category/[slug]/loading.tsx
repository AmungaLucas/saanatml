export default function CategoryLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-pulse">
        {/* Category header */}
        <div className="mb-8">
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        {/* Article grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[16/9] bg-muted rounded-lg" />
              <div className="h-3 w-20 bg-muted rounded-full" />
              <div className="h-5 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}