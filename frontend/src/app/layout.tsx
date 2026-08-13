import type { Metadata } from "next";
import { Reem_Kufi, Alexandria, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ToastContainer from "@/components/ToastContainer";


const reemKufi = Reem_Kufi({
  variable: "--font-arabic-display",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const alexandria = Alexandria({
  variable: "--font-arabic-body",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-english",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "OSK+ | منصة البث المتكاملة",
  description: "أفلام، مسلسلات، أنمي، أنيميشن - أربع منصات في مكان واحد",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.webp", type: "image/webp" },
    ],
    apple: { url: "/logo.webp" },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#0A0A0A",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${reemKufi.variable} ${alexandria.variable} ${outfit.variable} dark h-full`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OSK+" />
        <meta name="application-name" content="OSK+" />
        <link rel="apple-touch-icon" href="/logo_new.jpg" />
        <link rel="apple-touch-icon-precomposed" href="/logo_new.jpg" />
        <link rel="mask-icon" href="/icon.svg" color="#C9A84C" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-arabic-body">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
        <Providers>
          <Navbar />
          <ToastContainer />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
