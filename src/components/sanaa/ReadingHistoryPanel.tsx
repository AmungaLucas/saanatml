'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore, type ReadingHistoryEntry } from '@/store/useStore'
import { Clock, X, BookOpen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function ReadingHistoryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { readingHistory, clearHistory } = useStore()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Reading History
            </h4>
            <div className="flex items-center gap-1">
              {readingHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={clearHistory}
                  title="Clear history"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {readingHistory.length === 0 ? (
              <div className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reading history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {readingHistory.slice(0, 10).map(entry => (
                  <a
                    key={entry.articleId}
                    href={`/articles/${entry.slug}`}
                    className="flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
                      <img src={entry.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-xs line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {entry.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                          style={{ backgroundColor: entry.categoryColor + '15', color: entry.categoryColor }}
                        >
                          {entry.categoryName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTimeAgo(entry.readAt)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      {entry.progress > 0 && (
                        <div className="mt-1.5 h-0.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}