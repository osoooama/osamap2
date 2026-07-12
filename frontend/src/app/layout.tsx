import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ToastContainer from "@/components/ToastContainer";

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-english",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "OSK+ | منصة البث المتكاملة",
  description: "أفلام، مسلسلات، أنمي، أنيميشن - أربع منصات في مكان واحد",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${notoKufi.variable} ${montserrat.variable} dark h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-arabic">
        <Providers>
          <Navbar />
          <ToastContainer />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
