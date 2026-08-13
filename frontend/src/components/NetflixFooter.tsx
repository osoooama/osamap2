'use client';

import { Mail, GitBranch } from 'lucide-react';

const links = [
  { text: 'الأسئلة الشائعة', href: '#' },
  { text: 'مركز المساعدة', href: '#' },
  { text: 'حساب', href: '#' },
  { text: 'مركز الأجهزة', href: '#' },
  { text: 'شروط الاستخدام', href: '#' },
  { text: 'الخصوصية', href: '#' },
  { text: 'تفضيلات ملفات تعريف الارتباط', href: '#' },
  { text: 'معلومات الشركة', href: '#' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 mt-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <a href="mailto:osamakreshan49@gmail.com" className="text-zinc-500 hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <a href="https://github.com/osoooama" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
            <GitBranch className="w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {links.map((link) => (
            <a
              key={link.text}
              href={link.href}
              className="text-zinc-500 hover:text-zinc-300 text-xs sm:text-sm transition-colors underline-offset-4 hover:underline"
            >
              {link.text}
            </a>
          ))}
        </div>

        <button className="border border-zinc-600 px-3 py-1.5 text-zinc-500 text-xs rounded hover:text-white hover:border-zinc-400 transition-colors mb-4">
          خدمة العملاء
        </button>

        <p className="text-zinc-600 text-[10px] sm:text-xs leading-relaxed">
          OSK+ منصة بث متكاملة. جميع الأفلام والمسلسلات مأخوذة من مصادر عامة على الإنترنت. هذا الموقع لا يستضيف أي محتوى على خوادمه.
        </p>
        <p className="text-zinc-700 text-[10px] mt-2">
          © 2026 OSK+ by Osama Kreishan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
