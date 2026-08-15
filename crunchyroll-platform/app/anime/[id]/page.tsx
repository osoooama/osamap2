import Header from "@/components/Header";
import AnimeDetails from "@/components/AnimeDetails";
import Footer from "@/components/Footer";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main>
        <AnimeDetails animeId={id} />
      </main>
      <Footer />
    </div>
  );
}
