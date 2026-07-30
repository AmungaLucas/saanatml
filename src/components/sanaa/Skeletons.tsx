'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function StoryGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Category Filters */}
      <div className="flex gap-2 pb-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-md" />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] rounded-xl w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="h-5 w-6 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <Skeleton className="h-6 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ArticlePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Badge */}
      <Skeleton className="h-6 w-24 rounded-full mb-4" />

      {/* Title */}
      <Skeleton className="h-10 md:h-14 w-full mb-4" />
      <Skeleton className="h-5 w-3/4 mb-4" />

      {/* Excerpt */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-6" />

      {/* Author Meta */}
      <div className="flex items-center gap-4 pt-6 border-t border-border mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Cover Image */}
      <Skeleton className="aspect-[16/9] rounded-xl w-full mb-10" />

      {/* Body */}
      <div className="max-w-3xl space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-5/6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

export function EventsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-md" />
        ))}
      </div>

      {/* Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/9] rounded-xl w-full" />
        ))}
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-xl border border-border">
            <Skeleton className="h-16 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
