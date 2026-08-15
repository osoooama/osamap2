import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "IPTV Live — OSK+",
  description: "Modern IPTV player — watch live channels",
  icons: { icon: [{ url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" }] },
  robots: { index: false, follow: false },
  viewport: { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: "cover" },
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0C0C14" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
