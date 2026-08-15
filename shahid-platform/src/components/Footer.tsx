"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[#C9A96E]/10 mt-8 sm:mt-12 bg-[#060F0A]" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#B8944F] flex items-center justify-center shadow-lg shadow-[#C9A96E]/20">
            <span className="text-[#0A2818] text-sm font-black">ش</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-white tracking-tight">شاهد</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            ["الأسئلة الشائعة", "الشروط والأحكام", "سياسة الخصوصية", "تواصل معنا"],
            ["المساعدة", "الوظائف", "المدونة", "关于我们"],
          ].map((col, i) => (
            <div key={i} className="space-y-2">
              {col.map((item) => (
                <p key={item} className="text-zinc-500 text-xs sm:text-sm hover:text-[#C9A96E] cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#C9A96E]/5">
          <p className="text-zinc-600 text-xs">
            © 2026 شاهد — تم التطوير بواسطة Osama Kreishan
          </p>
          <div className="flex items-center gap-4">
            {["الخصوصية", "شروط الاستخدام", "إعدادات ملفات تعريف الارتباط"].map((item) => (
              <span key={item} className="text-zinc-600 text-xs hover:text-[#C9A96E] cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
