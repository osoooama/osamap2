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

### آلية العمل (الجديدة)
1. **TMDB API** يحصل على IDs لأشهر الأفلام والمسلسلات
2. **لكل موقع** crawler مخصص يستخدم Playwright لفتح صفحة المشاهدة
3. يستخرج رابط البث من iframe المشغل (play.xpass.top أو vid3rb.com)
4. **ليس هناك حاجة لـ AI Classifier** - التصنيف حسب الموقع
5. **Notifier** يرسل إشعار تلغرام بالروابط النظيفة
6. **MongoDB** يحفظ النتائج

### آلية العمل (الجديدة)
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
│   │   │   ├── cineby.py       # زاحف cineby.cc + streamex.net (عبر play.xpass.top)
│   │   │   ├── anime3rb.py     # زاحف anime3rb.com (عبر video.vid3rb.com)
│   │   │   └── animeslayer.py  # زاحف animeslayer.to
│   │   ├── crawler.py          # (قديم) احتياطي
│   │   ├── sources.py          # 4 مواقع فقط
│   │   ├── ai_classifier.py
│   │   ├── notifier.py
│   │   ├── run_all.py          # مشغل جميع الزاحفين
│   │   └── main.py             # نقطة الدخول
│   ├── requirements.txt
│   └── .env
└── .github/workflows/
    ├── scrape.yml
    └── test-crawl.yml
```

### قوائم المواقع (4 مواقع مستهدفة)
1. **cineby.cc** - أفلام أجنبية (عبر play.xpass.top)
2. **streamex.net** - أفلام أجنبية (عبر play.xpass.top - نفس محرك cineby)
3. **anime3rb.com** - أنمي عربي (عبر video.vid3rb.com)
4. **animeslayer.to** - أنمي عربي (عبر مشغل خاص)

## 🛠️ التقنيات المستخدمة
- **Frontend:** Next.js 16 (App Router, static export) + TypeScript + Tailwind CSS v4 + shadcn/ui v4 + Framer Motion + react-player + Clerk → Firebase Auth
- **Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + bcrypt + Resend
- **Scrapers:** Python 3.10+ + Crawlee + Playwright + BeautifulSoup + DeepSeek API
- **Auth:** Firebase Auth (Google OAuth) + Clerk (deprecated)
- **Deployment:** Cloudflare Pages (Frontend) + Render.com (Backend) + GitHub Actions (Scrapers)

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
NEXT_PUBLIC_API_URL=http://localhost:5000

# Scrapers (.env في scrapers/)
MONGODB_URI=mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?appName=Cluster0
TELEGRAM_BOT_TOKEN=8523313590:AAHtdiTZ3XcZbPQ7AROIts2_ZFfhVqugpS4
TELEGRAM_CHAT_ID=6328505405
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
