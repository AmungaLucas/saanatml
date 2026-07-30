import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/sanaa/ThemeProvider";
import { ToastProvider } from "@/components/sanaa/ActionToast";

const SITE_URL = 'https://sanaathrumylens.co.ke'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: "Sanaa Through My Lens — Arts & Culture Blog",
    template: "%s | Sanaa Through My Lens",
  },
  description: "An arts & culture opinion blog highlighting stories around the art scene in Kenya and East Africa — music, film, book reviews, commentary, events, and infortainment.",
  keywords: ["Kenya", "East Africa", "arts", "culture", "music", "film", "books", "visual arts", "theatre", "opinion"],
  authors: [{ name: "Sanaa Through My Lens" }],
  creator: "Sanaa Through My Lens",
  publisher: "Sanaa Through My Lens",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Sanaa Through My Lens",
    description: "Arts & Culture Opinion Blog — Kenya & East Africa",
    type: "website",
    url: SITE_URL,
    siteName: "Sanaa Through My Lens",
    locale: "en_KE",
    images: [{
      url: "/web-app-manifest-512x512.png",
      width: 512,
      height: 512,
      alt: "Sanaa Through My Lens",
    }],
  },
  twitter: {
    card: "summary",
    title: "Sanaa Through My Lens",
    description: "Arts & Culture Opinion Blog — Kenya & East Africa",
    images: ["/web-app-manifest-512x512.png"],
  },
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/rss`,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/web-app-manifest-192x192.png" />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}