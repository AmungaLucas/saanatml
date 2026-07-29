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

export type ViewType = 'home' | 'about' | 'events' | 'category' | 'author'

interface AppState {
  // Data
  articles: Article[]
  featuredArticles: Article[]
  categories: Category[]
  events: Event[]
  authors: Author[]

  // UI State
  selectedArticle: Article | null
  isArticleOpen: boolean
  isSearchOpen: boolean
  activeCategory: string
  searchQuery: string
  currentView: ViewType
  selectedAuthor: Author | null

  // Actions
  setArticles: (articles: Article[]) => void
  setFeaturedArticles: (articles: Article[]) => void
  setCategories: (categories: Category[]) => void
  setEvents: (events: Event[]) => void
  setAuthors: (authors: Author[]) => void
  openArticle: (article: Article) => void
  closeArticle: () => void
  toggleSearch: () => void
  setActiveCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setView: (view: ViewType, payload?: Author | null) => void
  goHome: () => void
}

export const useStore = create<AppState>((set) => ({
  articles: [],
  featuredArticles: [],
  categories: [],
  events: [],
  authors: [],
  selectedArticle: null,
  isArticleOpen: false,
  isSearchOpen: false,
  activeCategory: 'all',
  searchQuery: '',
  currentView: 'home',
  selectedAuthor: null,

  setArticles: (articles) => set({ articles }),
  setFeaturedArticles: (featuredArticles) => set({ featuredArticles }),
  setCategories: (categories) => set({ categories }),
  setEvents: (events) => set({ events }),
  setAuthors: (authors) => set({ authors }),
  openArticle: (article) => set({ selectedArticle: article, isArticleOpen: true }),
  closeArticle: () => set({ selectedArticle: null, isArticleOpen: false }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  setActiveCategory: (activeCategory) => set({ activeCategory, currentView: 'category' }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setView: (view, payload) => set({ currentView: view, selectedAuthor: payload || null }),
  goHome: () => set({ currentView: 'home', activeCategory: 'all', selectedAuthor: null }),
}))
