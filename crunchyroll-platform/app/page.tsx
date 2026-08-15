import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnimeGrid from "@/components/AnimeGrid";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main>
        <HeroSection />
        <AnimeGrid />
      </main>
      <Footer />
    </div>
  );
}
