import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import Navbar from "@/components/ui/Navbar";
import BottomNav from "@/components/ui/BottomNav";
import { MovieDetailModal } from "@/components/movie/MovieDetailModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSAMA/>Dev - Streaming Platform",
  description: "4-in-1 streaming platform: Netflix, Shahid, Disney+, Crunchyroll",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
          <BottomNav />
          <MovieDetailModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
