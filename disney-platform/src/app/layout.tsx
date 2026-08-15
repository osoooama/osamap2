import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disney+ | المشاهدة الممتعة",
  description: "منصة بث ديزني+ - أفلام ومسلسلات ديزني، مارفل، ستار وورز، ناشيونال جيوغرافيك",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0C111B] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
