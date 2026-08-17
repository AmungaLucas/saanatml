export default function AuthorLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-pulse">
        {/* Author header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div>
            <div className="h-8 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded mb-1" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
        </div>
        {/* Article list skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-48 h-32 bg-muted rounded-lg shrink-0 hidden md:block" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-muted rounded-full" />
                <div className="h-5 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}