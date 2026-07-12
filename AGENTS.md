# OSAMA/>Dev V2 – AGENTS.md (ملف الذاكرة الدائم)

## SYSTEM PROMPT (ثابت – يُرسل مرة واحدة)

### الدور
أنت مهندس برمجيات خبير في تطوير أنظمة الزحف Web Crawlers باستخدام Crawlee و Playwright، مع خبرة في استخراج روابط البث (Streaming Links) وتصفية الإعلانات، ودمج الذكاء الاصطناعي DeepSeek API، وإشعارات Telegram.
مستوى الجودة: Enterprise-Grade مع تركيز على الأداء، الأتمتة، وقابلية التوسع.

### القواعد
1. اقرأ AGENTS.md أولاً.
2. لا تفترض أي شيء – تحقق من الملفات قبل التعديل.
3. اختبر كل جزء قبل الانتقال إلى التالي.
4. استخدم الأوامر المحددة حرفياً.
5. عند مواجهة خطأ، أوقف العمل وأبلغ المستخدم.
6. لا تترك أبداً أخطاء TypeScript أو Python.
7. التزم بهيكل المشروع المحدد.

---

## 🏗️ هوية المشروع
- **الاسم:** OSAMA/>Dev V2
- **المطور:** أسامة كريشان (Osama Kreishan)
- **الهدف:** منصة بث متكاملة بـ 4 واجهات (نتفليكس، شاهد، ديزني بلس، كرانشي رول) مع مشغل فيديو احترافي وزاحف لـ 80 موقعاً.
- **المسار:** `C:\Users\osama\Documents\osamap2`

## 📡 مصادر الصور والبيانات (حسب المنصة)
| المنصة | المصدر | الفئة |
|--------|--------|-------|
| Netflix | TMDB API | foreign |
| Crunchyroll | TMDB API | anime |
| Shahid | الزاحف (Scraper) + احتياطي TMDB | arabic, turkish |
| Disney+ | الزاحف (Scraper) + احتياطي TMDB | animation |

## 🕷️ نظام الزحف الجديد (Crawlee + Playwright + DeepSeek)

### التقنيات
- **لغة:** Python 3.10+
- **مكتبة الزحف:** Crawlee (مع Playwright integration)
- **المتصفح:** Playwright (Chromium headless)
- **تحليل الصفحات:** BeautifulSoup + lxml
- **تصنيف المحتوى:** DeepSeek API (OpenAI-compatible)
- **الإشعارات:** Telegram Bot API
- **قاعدة البيانات:** MongoDB (PyMongo)
- **الجدولة:** GitHub Actions (cron كل 6 ساعات)

### آلية العمل
1. **TMDB API** يحصل على IDs لأشهر الأفلام والمسلسلات
2. **لكل موقع** crawler مخصص يستخدم Playwright لفتح صفحة المشاهدة
3. يستخرج رابط البث من iframe المشغل (play.xpass.top أو vid3rb.com)
4. **ليس هناك حاجة لـ AI Classifier** - التصنيف حسب الموقع
5. **Notifier** يرسل إشعار تلغرام بالروابط النظيفة
6. **MongoDB** يحفظ النتائج

### هيكل المجلدات
```
osamap2/
├── backend/
├── frontend/
├── scrapers/
│   ├── src/
│   │   ├── sites/
│   │   │   ├── base.py         # دوال مشتركة (حفظ في MongoDB)
│   │   │   ├── cineby.py       # زاحف streamex.sh (عبر play.xpass.top)
│   │   │   ├── anime3rb.py     # زاحف anime3rb.com القديم
│   │   │   ├── anime3rb_v2.py  # زاحف محسّن يستخرج vid3rb sources عبر JS
│   │   │   ├── animeslayer.py  # زاحف animeslayer.to
│   │   │   ├── cinemana.py     # زاحف cinemana.cc (عربي/تركي HLS عبر Server.php)
│   │   │   ├── hd1brstej.py    # زاحف hd1.brstej.com (4 سيرفرات: hdup20, film77, hd-vk, ok.ru)
│   │   │   └── arabic_sites.py # زاحف mycima/eegebest/fajer/3iskk/7obtv/dizipal
│   │   ├── sources.py          # 11 موقعاً
│   │   ├── notifier.py
│   │   ├── run_all.py          # مشغل جميع الزاحفين
│   │   └── main.py             # نقطة الدخول
│   ├── requirements.txt
│   └── .env
└── .github/workflows/
    ├── scrape.yml
    └── test-crawl.yml
```

### قوائم المواقع (11 موقعاً)
| الموقع | الفئة | التقنية |
|--------|-------|---------|
| streamex.sh | foreign | play.xpass.top (HLS) |
| anime3rb.com | anime | video.vid3rb.com (MP4) |
| animeslayer.to | anime | ← redirects to cinemana.cc |
| cinemana.cc | arabic/turkish | Fasel-HD CDN (scdns.io) عبر Server.php |
| hd1.brstej.com | arabic | 4 سيرفرات: hdup20, film77, hd-vk, ok.ru (JW Player) |
| mycima.video | arabic | متنوع |
| eegebest.com | arabic | متنوع |
| fajer.show | arabic | متنوع |
| 3iskk.xyz | arabic | متنوع |
| 7obtv.co | arabic | متنوع |
| dizipal2085.com | turkish | متنوع |

### قوائم المواقع (4 مواقع مستهدفة)
1. **cineby.cc** - أفلام أجنبية (عبر play.xpass.top)
2. **streamex.net** - أفلام أجنبية (عبر play.xpass.top - نفس محرك cineby)
3. **anime3rb.com** - أنمي عربي (عبر video.vid3rb.com)
4. **animeslayer.to** - أنمي عربي (عبر مشغل خاص)

## 🛠️ التقنيات المستخدمة
- **Frontend:** Next.js 16 (App Router, static export) + TypeScript + Tailwind CSS v4 + shadcn/ui v4 + Framer Motion + react-player
- **Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + bcrypt + Resend
- **Scrapers:** Python 3.10+ + Crawlee + Playwright + BeautifulSoup + DeepSeek API
- **Auth:** Clerk (`@clerk/clerk-react` — not `@clerk/nextjs`, تجنباً لتعارض Server Actions مع static export)
- **Deployment:** Cloudflare Pages (Frontend) + Render.com (Backend) + GitHub Actions (Scrapers)

### ⚠️ مهم: Clerk مع static export
- `@clerk/nextjs` يستخدم Server Actions → لا يعمل مع `output: 'export'`
- الحل: استخدام `@clerk/clerk-react` بدلاً منه (واجهة React الخالصة بدون Next.js-specific features)
- الاستيرادات المستخدمة: `ClerkProvider`, `useAuth`, `useUser`, `useClerk`, `useSignIn`
- صفحة تسجيل الدخول: custom (ليست `<SignIn/>`) لتفادي Server Actions

### الصفحات (static routes)
- `/` — Landing page
- `/sign-in` — Custom sign-in page
- `/netflix`, `/shahid`, `/disney`, `/crunchyroll` — صفحات المنصات
- `/player` — مشغل الفيديو

## 🔑 متغيرات البيئة
```env
# Backend (.env في backend/)
PORT=5000
MONGODB_URI=mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?appName=Cluster0
JWT_SECRET=osamadev_super_secret_key_2026
TMDB_API_KEY=b4905ea858601abd0565baa117b69b24
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_it6jg38M_7mvdMF43nfqVFz9F8f9Q552Q
TELEGRAM_BOT_TOKEN=8523313590:AAHtdiTZ3XcZbPQ7AROIts2_ZFfhVqugpS4
TELEGRAM_CHAT_ID=6328505405
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local في frontend/)
NEXT_PUBLIC_API_URL=https://osamap2.onrender.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsub3NhbWFwMi5wYWdlcy5kZXYk

# Scrapers (.env في scrapers/)
MONGODB_URI=mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?appName=Cluster0
TELEGRAM_BOT_TOKEN=8523313590:AAHtdiTZ3XcZbPQ7AROIts2_ZFfhVqugpS4
TELEGRAM_CHAT_ID=6328505405
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Work State
### Completed
- **Provider testing**: 5/17 working (StreameX, vidlink, screenscape, vidplays, modocine). Broken ones dimmed with green badge.
- **New scrapers**: cinemana.py, hd1brstej.py, anime3rb_v2.py added.
- **Platform pages redesigned**: Netflix/Shahid/Crunchyroll/Disney with movie/TV separation.
- **Cloudflare deploy**: https://9595f259.osamap2.pages.dev
- **Clerk auth**: Email OTP only, custom sign-in page (`/sign-in`) with OSK+ logo, dark theme, animated transitions.
- **Route protection**: AuthGuard on all platform/player/search pages. No middleware (static export).
- **Scrapers**: 11 site crawlers run on GitHub Actions (`scrape.yml`, cron `*/15 * * * *`), each run completes in ~38s.
- **MongoDB resilience**: All DB ops wrapped in try/except. Scrapers work without DB.

### Active
- **Scrapers** stored data in MongoDB (verified on GitHub Actions). Cannot check from local machine (TLS handshake blocked by network/VPN).
- **Custom email template**: Designed (65k HTML, dark theme, OSK+ logo, social icons) but cannot save — Clerk Hobby plan blocks custom templates in production.

### Blocked
- **Local MongoDB**: `WinError 10054` TLS handshake failure from this machine. Workaround: GitHub Actions + `tlsInsecure=true` not sufficient.
- **Custom email template**: Requires Clerk Growth plan ($12/mo) or Resend API webhook alternative.
- **Scrapers produce 0 streams** from local run (anime3rb: no vid3rb iframes found). Needs investigation.

### Known Issues
- anime3rb.com blocked by Cloudflare (403 "Just a moment...") — crawler cannot access site.
- animeslayer.to uses XOR/base64 encoded episode URLs + ad popups/redirects — crawler updated with decode logic.
- Local MongoDB: `WinError 10054` TLS handshake failure (network/VPN block). Can only check via GitHub Actions.
- Custom email template: Blocked by Clerk Hobby plan in production. Needs plan upgrade or Resend API.
- Test files cleaned from repo history.

