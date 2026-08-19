export default function ArticleLoading() {
  return (
    <div className="min-h-screen">
      {/* Sticky action bar skeleton */}
      <div className="sticky top-0 z-10 h-12 border-b bg-background/80 backdrop-blur" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-6">
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="h-3 w-3 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        
        {/* Category badge */}
        <div className="h-6 w-24 bg-muted rounded-full mb-4" />
        
        {/* Title */}
        <div className="h-10 w-3/4 bg-muted rounded mb-4" />
        <div className="h-10 w-1/2 bg-muted rounded mb-6" />
        
        {/* Excerpt */}
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded mb-6" />
        
        {/* Author meta */}
        <div className="flex items-center gap-4 pt-6 border-t">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div>
            <div className="h-3 w-24 bg-muted rounded mb-1" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
        
        {/* Cover image */}
        <div className="mt-8 aspect-[16/9] bg-muted rounded-xl" />
        
        {/* Content */}
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}