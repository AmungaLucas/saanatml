import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/sanaa/ThemeProvider";

export const metadata: Metadata = {
  title: "Sanaa Through My Lens — Arts & Culture Blog",
  description: "An arts & culture opinion blog highlighting stories around the art scene in Kenya and East Africa — music, film, book reviews, commentary, events, and infortainment.",
  keywords: ["Kenya", "East Africa", "arts", "culture", "music", "film", "books", "visual arts", "theatre", "opinion"],
  openGraph: {
    title: "Sanaa Through My Lens",
    description: "Arts & Culture Opinion Blog — Kenya & East Africa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
