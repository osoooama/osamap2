export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 sm:mt-12 bg-[#0a0a0f]" dir="ltr">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#F47521] flex items-center justify-center shadow-lg shadow-[#F47521]/20">
                <span className="text-white text-xs font-black">CR</span>
              </div>
              <span className="text-white font-bold text-sm">
                CRUNCHY<span className="text-[#F47521]">ROLL</span>
              </span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              Your destination for anime. Stream thousands of episodes and movies.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Browse</h4>
            <div className="space-y-2">
              {["Popular", "New Releases", "Simulcasts", "Movies", "OVAs", "Specials"].map((item) => (
                <p key={item} className="text-zinc-500 text-xs hover:text-[#F47521] cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Genres</h4>
            <div className="space-y-2">
              {["Action", "Romance", "Comedy", "Fantasy", "Sci-Fi", "Horror"].map((item) => (
                <p key={item} className="text-zinc-500 text-xs hover:text-[#F47521] cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Connect</h4>
            <div className="space-y-2">
              {["Twitter", "Discord", "Instagram", "YouTube"].map((item) => (
                <p key={item} className="text-zinc-500 text-xs hover:text-[#F47521] cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
          <p className="text-zinc-600 text-xs">
            © 2026 Crunchyroll Platform — Developed by Osama Kreishan
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Use", "Cookie Preferences"].map((item) => (
              <span key={item} className="text-zinc-600 text-xs hover:text-[#F47521] cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>

        <p className="text-zinc-700 text-[10px] mt-4 text-center">
          Powered by Jikan API — MyAnimeList unofficial API
        </p>
      </div>
    </footer>
  );
}
