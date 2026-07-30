'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { BookmarkCheck, Heart, MessageSquare, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: string
  type: 'bookmark' | 'unbookmark' | 'like' | 'unlike' | 'comment' | 'copy'
  message: string
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useActionToast() {
  return useContext(ToastContext)
}

let toastId = 0

const iconMap = {
  bookmark: <BookmarkCheck className="h-3.5 w-3.5 fill-gold text-gold" />,
  unbookmark: <BookmarkCheck className="h-3.5 w-3.5 text-muted-foreground" />,
  like: <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />,
  unlike: <Heart className="h-3.5 w-3.5 text-muted-foreground" />,
  comment: <MessageSquare className="h-3.5 w-3.5 text-primary" />,
  copy: <Check className="h-3.5 w-3.5 text-green-500" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastId}`
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg backdrop-blur-xl"
            >
              {iconMap[toast.type]}
              <span className="text-sm font-medium whitespace-nowrap">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
