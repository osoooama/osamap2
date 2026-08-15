import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Netflix Platform",
  description: "منصة نيتفليكس — أفلام ومسلسلات عالمية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">{children}</body>
    </html>
  );
}
