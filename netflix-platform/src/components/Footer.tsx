"use client";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-8 sm:mt-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl sm:text-2xl font-black text-[#E50914] tracking-tighter">
            NETFLIX
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            ["الوصف العملي", "الأسلحة والمعدات", "مركز المساعدة", "شركة وسائل الإعلام"],
            ["العلاقات العامة", "الوظائف", "استخدام Cookies", "المعلومات القانونية"],
          ].map((col, i) => (
            <div key={i} className="space-y-2">
              {col.map((item) => (
                <p key={item} className="text-zinc-500 text-xs sm:text-sm hover:text-zinc-300 cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-zinc-800/50">
          <p className="text-zinc-600 text-xs">
            © 2026 Netflix Platform — تم التطوير بواسطة Osama Kreishan
          </p>
          <div className="flex items-center gap-4">
            {["الخصوصية", "شروط الاستخدام", "إعدادات ملفات تعريف الارتباط"].map((item) => (
              <span key={item} className="text-zinc-600 text-xs hover:text-zinc-400 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
