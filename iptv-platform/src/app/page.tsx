import { ChannelBrowser } from "@/components/ChannelBrowser";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <ChannelBrowser />
    </main>
  );
}
