export default function MakersLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded mb-2" />
        <div className="h-4 w-96 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto" />
              <div className="h-5 w-32 bg-muted rounded mx-auto" />
              <div className="h-3 w-24 bg-muted rounded-full mx-auto" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}