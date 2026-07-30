import { create } from 'zustand'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  categoryId: string
  category: { id: string; name: string; slug: string; description: string; color: string }
  authorId: string
  author: { id: string; name: string; slug: string; bio: string; avatar: string; role: string }
  publishedAt: string
  readTime: number
  views: number
  tags: string
  isFeatured: boolean
  isPinned: boolean
  commentCount?: number
  comments?: Comment[]
}

export interface Comment {
  id: string
  articleId: string
  author: string
  content: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  endDate?: string | null
  venue: string
  city: string
  category: string
  categoryId?: string | null
  categoryRef?: { name: string; color: string } | null
  imageUrl: string
  ticketUrl: string
  isFeatured: boolean
  isPast: boolean
}

export interface Author {
  id: string
  name: string
  slug: string
  bio: string
  avatar: string
  role: string
}

export interface Maker {
  id: string
  name: string
  slug: string
  discipline: string
  bio: string
  location: string
  website: string
  instagram: string
  twitter: string
  isFeatured: boolean
}

export type ViewType = 'home' | 'about' | 'events' | 'category' | 'author'

// ========== localStorage helpers ==========
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

const BOOKMARKS_KEY = 'sanaa-bookmarks'
const LIKES_KEY = 'sanaa-likes'
const HISTORY_KEY = 'sanaa-reading-history'

export interface ReadingHistoryEntry {
  articleId: string
  slug: string
  title: string
  coverImage: string
  categoryName: string
  categoryColor: string
  readAt: string
  progress: number
}

// ========== Store Interface ==========
interface AppState {
  // Data
  articles: Article[]
  featuredArticles: Article[]
  categories: Category[]
  events: Event[]
  authors: Author[]
  makers: Maker[]
  dataLoaded: boolean

  // UI State
  selectedArticle: Article | null
  isArticleOpen: boolean
  selectedEvent: Event | null
  isEventOpen: boolean
  isSearchOpen: boolean
  activeCategory: string
  searchQuery: string
  currentView: ViewType
  selectedAuthor: Author | null

  // Bookmarks
  bookmarks: string[]

  // Likes
  likes: Record<string, number> // articleId -> like count (1 or 0)

  // Reading History
  readingHistory: ReadingHistoryEntry[]

  // Actions
  setArticles: (articles: Article[]) => void
  setFeaturedArticles: (articles: Article[]) => void
  setCategories: (categories: Category[]) => void
  setEvents: (events: Event[]) => void
  setAuthors: (authors: Author[]) => void
  setMakers: (makers: Maker[]) => void
  setDataLoaded: (loaded: boolean) => void
  openArticle: (article: Article) => void
  closeArticle: () => void
  openEvent: (event: Event) => void
  closeEvent: () => void
  toggleSearch: () => void
  setActiveCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setView: (view: ViewType, payload?: Author | null) => void
  goHome: () => void
  toggleBookmark: (articleId: string) => void
  isBookmarked: (articleId: string) => boolean
  toggleLike: (articleId: string) => void
  isLiked: (articleId: string) => boolean
  addToHistory: (article: Article, progress?: number) => void
  updateHistoryProgress: (articleId: string, progress: number) => void
  clearHistory: () => void
}

export const useStore = create<AppState>((set, get) => ({
  articles: [],
  featuredArticles: [],
  categories: [],
  events: [],
  authors: [],
  makers: [],
  dataLoaded: false,
  selectedArticle: null,
  isArticleOpen: false,
  selectedEvent: null,
  isEventOpen: false,
  isSearchOpen: false,
  activeCategory: 'all',
  searchQuery: '',
  currentView: 'home',
  selectedAuthor: null,
  bookmarks: loadFromStorage<string[]>(BOOKMARKS_KEY, []),
  likes: loadFromStorage<Record<string, number>>(LIKES_KEY, {}),
  readingHistory: loadFromStorage<ReadingHistoryEntry[]>(HISTORY_KEY, []),

  setArticles: (articles) => set({ articles }),
  setFeaturedArticles: (featuredArticles) => set({ featuredArticles }),
  setCategories: (categories) => set({ categories }),
  setEvents: (events) => set({ events }),
  setAuthors: (authors) => set({ authors }),
  setMakers: (makers) => set({ makers }),
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
  openArticle: (article) => set({ selectedArticle: article, isArticleOpen: true }),
  closeArticle: () => set({ selectedArticle: null, isArticleOpen: false }),
  openEvent: (event) => set({ selectedEvent: event, isEventOpen: true }),
  closeEvent: () => set({ selectedEvent: null, isEventOpen: false }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  setActiveCategory: (activeCategory) => set({ activeCategory, currentView: 'category' }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setView: (view, payload) => set({ currentView: view, selectedAuthor: payload || null }),
  goHome: () => set({ currentView: 'home', activeCategory: 'all', selectedAuthor: null }),

  toggleBookmark: (articleId) => {
    const current = get().bookmarks
    const next = current.includes(articleId)
      ? current.filter(id => id !== articleId)
      : [...current, articleId]
    set({ bookmarks: next })
    saveToStorage(BOOKMARKS_KEY, next)
  },

  isBookmarked: (articleId) => get().bookmarks.includes(articleId),

  toggleLike: (articleId) => {
    const current = get().likes
    const next = { ...current }
    if (next[articleId] === 1) {
      delete next[articleId]
    } else {
      next[articleId] = 1
    }
    set({ likes: next })
    saveToStorage(LIKES_KEY, next)
  },

  isLiked: (articleId) => (get().likes[articleId] || 0) === 1,

  addToHistory: (article, progress = 0) => {
    const history = [...get().readingHistory]
    // Remove existing entry for this article
    const filtered = history.filter(h => h.articleId !== article.id)
    // Add new entry at the beginning
    const entry: ReadingHistoryEntry = {
      articleId: article.id,
      slug: article.slug,
      title: article.title,
      coverImage: article.coverImage,
      categoryName: article.category.name,
      categoryColor: article.category.color,
      readAt: new Date().toISOString(),
      progress,
    }
    const updated = [entry, ...filtered].slice(0, 50) // Keep max 50 entries
    set({ readingHistory: updated })
    saveToStorage(HISTORY_KEY, updated)
  },

  updateHistoryProgress: (articleId, progress) => {
    const history = get().readingHistory.map(h =>
      h.articleId === articleId ? { ...h, progress } : h
    )
    set({ readingHistory: history })
    saveToStorage(HISTORY_KEY, history)
  },

  clearHistory: () => {
    set({ readingHistory: [] })
    saveToStorage(HISTORY_KEY, [])
  },
}))
