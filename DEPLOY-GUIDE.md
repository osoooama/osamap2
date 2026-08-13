# خطوات نشر TMDB-Embed-API على Render

## الخطوة 1: افتح Render Dashboard
- اذهب到 https://dashboard.render.com
- سجل الدخول بحسابك

## الخطوة 2: أنشئ خدمة جديدة
1. اضغط **New +** في الأعلى
2. اختر **Web Service**
3. اضغط **Build a manual repository** أو اختر GitHub

## الخطوة 3: اربط المستودع
1. اختر مستودع `osoooama/osamap2`
2. اضغط **Connect**

## الخطوة 4: اضبط الإعدادات
| الإعداد | القيمة |
|---------|--------|
| **Name** | `osamap2-embed-api` |
| **Root Directory** | `embed-api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | `Free` |

## الخطوة 5: أنشئ الخدمة
1. اضغط **Create Web Service**
2. انتظر حتى يكتمل البناء (1-2 دقيقة)

## الخطوة 6: حدد متغيرات البيئة
في صفحة الخدمة، اذهب到 **Environment** وأضف:
| Variable | Value |
|----------|-------|
| `PORT` | `8787` |

## الخطوة 7: اختبر
```bash
curl https://osamap2-embed-api.onrender.com/api/streams/movie/550
```

## الخطوة 8: حدد URL في Backend
في Render Dashboard → Backend Service → Environment:
| Variable | Value |
|----------|-------|
| `TMDB_EMBED_API_URL` | `https://osamap2-embed-api.onrender.com` |

---

## ملاحظة مهمة
إذا كنت تريد النشر التلقائي، تأكد من أن:
1. المستودع مربوط بـ Render
2. ملف `render.yaml` في جذر المستودع
3. Render يراقب التغييرات الجديدة

**الرابط المباشر للنشر:**
https://render.com/blueprint/new?repo=https://github.com/osoooama/osamap2
