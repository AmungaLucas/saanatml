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

// Load bookmarks from localStorage
function loadBookmarks(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('sanaa-bookmarks')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveBookmarks(bookmarks: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('sanaa-bookmarks', JSON.stringify(bookmarks))
  } catch {
    // ignore
  }
}

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
  isSearchOpen: boolean
  activeCategory: string
  searchQuery: string
  currentView: ViewType
  selectedAuthor: Author | null

  // Bookmarks
  bookmarks: string[]

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
  toggleSearch: () => void
  setActiveCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setView: (view: ViewType, payload?: Author | null) => void
  goHome: () => void
  toggleBookmark: (articleId: string) => void
  isBookmarked: (articleId: string) => boolean
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
  isSearchOpen: false,
  activeCategory: 'all',
  searchQuery: '',
  currentView: 'home',
  selectedAuthor: null,
  bookmarks: loadBookmarks(),

  setArticles: (articles) => set({ articles }),
  setFeaturedArticles: (featuredArticles) => set({ featuredArticles }),
  setCategories: (categories) => set({ categories }),
  setEvents: (events) => set({ events }),
  setAuthors: (authors) => set({ authors }),
  setMakers: (makers) => set({ makers }),
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
  openArticle: (article) => set({ selectedArticle: article, isArticleOpen: true }),
  closeArticle: () => set({ selectedArticle: null, isArticleOpen: false }),
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
    saveBookmarks(next)
  },

  isBookmarked: (articleId) => get().bookmarks.includes(articleId),
}))
