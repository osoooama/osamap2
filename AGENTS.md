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
1. **Crawler** يزور كل موقع من الـ 80 موقعاً
2. يستخرج روابط البث (.m3u8, .mpd, .mp4)
3. يتجاوز الإعلانات والروابط المختصرة (shortened URLs)
4. **AI Classifier** يصنف المحتوى عبر DeepSeek API (جودة، فئة، لغة)
5. **Notifier** يرسل إشعار تلغرام بالروابط النظيفة
6. **MongoDB** يحفظ النتائج للرجوع إليها لاحقاً

### هيكل المجلدات
```
osamap2/
├── backend/
├── frontend/
├── scrapers/
│   ├── src/
│   │   ├── crawler.py
│   │   ├── sources.py
│   │   ├── ai_classifier.py
│   │   ├── notifier.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
└── .github/workflows/scrape.yml
```

### قوائم المواقع (80 موقعاً)
**أجنبي (20):** cineby.cc, streamex.net, hydrahd.com, nunflix.cc, rivestream.com, watchug.com, vidbox.tv, broflix.org, flickystream.com, mapple.tv, alienflix.com, novastream.to, tubitv.com, plutotv.com, crackle.com, therokuchannel.roku.com, amazon.com/adlp/freevee, peacocktv.com, plex.tv, vudu.com

**عربي (20):** arabseed.ws, akwam.cc, faselplus.cc, mycima.video, cimaclub.com, 3isk.tv, qrmzi.com, watanflix.com, egybest.com, elcinema.com, a.qfilm.tv, r.cimalight.co, shoofdrama.com, laroza.video, hekat-tv.com, dramaturkey.com, hilalplay.com, shahid.mbc.net, starzplay.com, viu.com

**تركي (20):** kayifamily.com, dizipal.com, diziwatch.net, fullhdfilmizle.com, dizigom.net, dizibox.com, turkish123.com, diziyou.com, blutv.com, puhutv.com, turkflix.net, osmanonline.com, dizimania.com, yoturkish.com, serial4u.com, promix.tv, dizistar.com, teknoasian.com, sinemalar.com, hdfilmcehennemi.com

**أنمي (20):** hianime.to, anime-defenders.com, anigo.one, jkanime.net, animeunity.tv, anitaku.to, miruro.tv, aniwave.to, animeyat.net, animeout.xyz, animeblix.com, animixplay.to, witanime.com, anime4up.com, shahiid-anime.net, anime3rb.com, animeslayer.to, animekaizoku.com, animovitch.com, animegon.com

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
