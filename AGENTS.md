# 🧠 OSAMA/>Dev V2 – AGENTS.md (ملف الذاكرة الدائم)

## 🏗️ هوية المشروع
- **الاسم:** OSAMA/>Dev V2  
- **المطور:** أسامة كريشان (Osama Kreishan)  
- **الهدف:** منصة بث متكاملة بـ 4 واجهات (نتفليكس، شاهد، ديزني بلس، كرانشي رول) مع مشغل فيديو احترافي وزاحف لـ 80 موقعاً.  
- **المسار:** `C:\Users\osama\Documents\osamap2`

## 🧩 المصادر والملفات الأولية
- **تصميمات الواجهات المستنسخة:** `C:\Users\osama\Desktop\واجهات`  
  (يحتوي على مجلدات: Netflix, Shahid, Disney, Crunchyroll)
- **ملفات التصميم:** يتم نسخ الهيكل والألوان والتنسيق فقط، **بدون الصور الثابتة**.

## 📡 مصادر الصور والبيانات (حسب المنصة)
| المنصة | المصدر | الفئة |
|--------|--------|-------|
| Netflix | TMDB API | foreign |
| Crunchyroll | TMDB API | anime |
| Shahid | الزاحف (Scraper) + احتياطي TMDB | arabic, turkish |
| Disney+ | الزاحف (Scraper) + احتياطي TMDB | animation |

## 🎬 المشغل (Video Player)
- **النوع:** طبقة منبثقة (Overlay) تظهر فوق الصفحة.
- **المكتبة:** `react-player` مع دعم HLS و MP4.
- **الأزرار:** تشغيل/إيقاف، ملء الشاشة، اختيار الجودة (4K/1080p/720p)، تفعيل/تعطيل الترجمة.

## 🕷️ نظام الزحف (Scrapers) – 80 موقعاً
- **اللغة:** Python 3.10+ مع Playwright.
- **المواقع:** 20 موقعاً لكل فئة (أجنبي، عربي، تركي، أنمي).
- **آلية العمل:** زيارة كل موقع، استخراج رابط `iframe` أو الفيديو، حفظه في MongoDB مع إشعار تلغرام.
- **الجدولة:** GitHub Actions كل 6 ساعات.

### قوائم المواقع (80 موقعاً):
**أجنبي (20):** cineby.cc, streamex.net, hydrahd.com, nunflix.cc, rivestream.com, watchug.com, vidbox.tv, broflix.org, flickystream.com, mapple.tv, alienflix.com, novastream.to, tubitv.com, plutotv.com, crackle.com, therokuchannel.roku.com, amazon.com/adlp/freevee, peacocktv.com, plex.tv, vudu.com
**عربي (20):** arabseed.ws, akwam.cc, faselplus.cc, mycima.video, cimaclub.com, 3isk.tv, qrmzi.com, watanflix.com, egybest.com, elcinema.com, a.qfilm.tv, r.cimalight.co, shoofdrama.com, laroza.video, hekat-tv.com, dramaturkey.com, hilalplay.com, shahid.mbc.net, starzplay.com, viu.com
**تركي (20):** kayifamily.com, dizipal.com, diziwatch.net, fullhdfilmizle.com, dizigom.net, dizibox.com, turkish123.com, diziyou.com, blutv.com, puhutv.com, turkflix.net, osmanonline.com, dizimania.com, yoturkish.com, serial4u.com, promix.tv, dizistar.com, teknoasian.com, sinemalar.com, hdfilmcehennemi.com
**أنمي (20):** hianime.to, anime-defenders.com, anigo.one, jkanime.net, animeunity.tv, anitaku.to, miruro.tv, aniwave.to, animeyat.net, animeout.xyz, animeblix.com, animixplay.to, witanime.com, anime4up.com, shahiid-anime.net, anime3rb.com, animeslayer.to, animekaizoku.com, animovitch.com, animegon.com

## 🛠️ التقنيات المستخدمة
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Scrapers:** Python 3.10 + Playwright + BeautifulSoup
- **Auth:** JWT + bcrypt + Resend (إيميلات)
- **Deployment:** Cloudflare Pages (Frontend) + Render.com (Backend)

## 🔑 متغيرات البيئة (المفاتيح)
```env
# Backend (.env في backend/)
PORT=5000
MONGODB_URI=mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?appName=Cluster0
JWT_SECRET=osamadev_super_secret_key_2026
TMDB_API_KEY=b4905ea858601abd0565baa117b69b24
DEEPSEEK_API_KEY=sk-2005ad64c9d54249ae56ee1c2417a7c5
RESEND_API_KEY=re_it6jg38M_7mvdMF43nfqVFz9F8f9Q552Q
TELEGRAM_BOT_TOKEN=8523313590:AAHtdiTZ3XcZbPQ7AROIts2_ZFfhVqugpS4
TELEGRAM_CHAT_ID=6328505405
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local في frontend/)
NEXT_PUBLIC_API_URL=http://localhost:5000
