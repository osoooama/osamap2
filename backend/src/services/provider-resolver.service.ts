import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';

const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const CACHE_TTL = 30 * 60 * 1000;

const titleCache = new Map<string, { title: string; ts: number }>();
const resultCache = new Map<string, { url: string; ts: number }>();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'ar,en;q=0.9' };

const AD_KEYWORDS = ['doubleclick', 'googlesyndication', 'adservice', 'popunder', 'exoclick', 'propellerads', 'linkvertise', 'adfoc', 'adserver', 'googlead', 'taboola', 'outbrain', 'mgid', 'criteo', 'moatads', 'pubmatic', 'appnexus'];

let Link: mongoose.Model<any>;
async function getLinkModel() {
  if (!Link) Link = (await import('../models/Link.model')).default;
  return Link;
}

function isAdUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return AD_KEYWORDS.some(d => lower.includes(d));
}

function isStreamUrl(url: string): boolean {
  return /\.(m3u8|mpd|mp4|webm|ts|mkv|mov)(\?|$)/i.test(url);
}

function extractUrls(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();
  const patterns = [
    /(?:src|file|url|source|stream)\s*[:=]\s*["']([^"']*\.(m3u8|mp4|mpd|webm)[^"']*)["']/gi,
    /(?:https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mpd|webm)(?:\?[^\s"'<>]*)?)/gi,
  ];
  for (const pat of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(html)) !== null) {
      let url = m[1] || m[0];
      if (url && !isAdUrl(url)) {
        if (url.startsWith('//')) url = 'https:' + url;
        else if (url.startsWith('/')) {
          try { url = new URL(url, baseUrl).href; } catch { continue; }
        }
        if (url.startsWith('http')) urls.add(url);
      }
    }
  }
  return [...urls];
}

function extractIframes(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const srcs = new Set<string>();
  $('iframe').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && !isAdUrl(src)) {
      let full = src;
      if (src.startsWith('//')) full = 'https:' + src;
      else if (src.startsWith('/')) {
        try { full = new URL(src, baseUrl).href; } catch { return; }
      }
      if (full.startsWith('http')) srcs.add(full);
    }
  });
  return [...srcs];
}

function findContentLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href && (href.includes('/movie/') || href.includes('/tv/') || href.includes('/film/') || href.includes('/dizi/') || href.includes('/watch/') || href.includes('/episode/'))) {
      let full = href;
      if (href.startsWith('/')) {
        try { full = new URL(href, baseUrl).href; } catch { return; }
      }
      if (full.startsWith('http')) links.add(full);
    }
  });
  return [...links];
}

export async function getTmdbTitle(tmdbId: string): Promise<string | null> {
  if (!/^\d+$/.test(tmdbId)) return null;
  const cached = titleCache.get(tmdbId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.title;
  if (!TMDB_KEY) return null;

  try {
    const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&language=ar`, { timeout: 5000 });
    const title = data.title || data.original_title || null;
    if (title) titleCache.set(tmdbId, { title, ts: Date.now() });
    return title;
  } catch {
    try {
      const { data } = await axios.get(`${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar`, { timeout: 5000 });
      const title = data.name || data.original_name || null;
      if (title) titleCache.set(tmdbId, { title, ts: Date.now() });
      return title;
    } catch { return null; }
  }
}

async function httpGet(url: string, timeout = 8000): Promise<string | null> {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout, maxRedirects: 5 });
    return typeof data === 'string' ? data : JSON.stringify(data);
  } catch { return null; }
}

async function httpPost(url: string, body: string | URLSearchParams, extra: Record<string, string> = {}, timeout = 8000): Promise<string | null> {
  try {
    const { data } = await axios.post(url, body, { headers: { ...HEADERS, ...extra }, timeout });
    return typeof data === 'string' ? data : JSON.stringify(data);
  } catch { return null; }
}

async function saveToDb(tmdbId: string, url: string, source: string, category: string) {
  try {
    const LinkModel = await getLinkModel();
    await LinkModel.updateOne(
      { tmdb_id: tmdbId, source },
      { $set: {
        tmdb_id: tmdbId, embed_url: url, source, category,
        platform: category === 'arabic' || category === 'turkish' ? 'shahid' : 'netflix',
        is_active: true, last_checked: new Date(),
      }},
      { upsert: true }
    );
  } catch { /* DB errors are non-fatal */ }
}

function getCached(key: string): { url: string; source: string } | null {
  const c = resultCache.get(key);
  if (c && Date.now() - c.ts < CACHE_TTL) return { url: c.url, source: key.split(':')[1] };
  return null;
}

function setCache(key: string, url: string) {
  resultCache.set(key, { url, ts: Date.now() });
}

interface ResolveResult { url: string; source: string; }

async function trySite(
  tmdbId: string, title: string, baseUrl: string, searchPath: string,
  sourceName: string, category: string,
  linkSelector?: string
): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:${sourceName}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const searchUrl = `${baseUrl}${searchPath}${encodeURIComponent(title)}`;
  const html = await httpGet(searchUrl);
  if (!html || html.includes('Just a moment') || html.includes('cf-browser-verification')) return null;

  const contentLinks = findContentLinks(html, baseUrl);
  const targetLinks = linkSelector ? contentLinks.filter(l => l.includes(linkSelector)) : contentLinks;

  for (const linkUrl of targetLinks.slice(0, 3)) {
    const contentHtml = await httpGet(linkUrl);
    if (!contentHtml) continue;

    const streamUrls = extractUrls(contentHtml, linkUrl);
    for (const url of streamUrls) {
      if (isStreamUrl(url)) {
        setCache(cacheKey, url);
        await saveToDb(tmdbId, url, sourceName, category);
        return { url, source: sourceName };
      }
    }

    const iframes = extractIframes(contentHtml, linkUrl);
    for (const iframe of iframes) {
      if (isAdUrl(iframe)) continue;
      const playerHtml = await httpGet(iframe);
      if (!playerHtml) continue;
      const playerUrls = extractUrls(playerHtml, iframe);
      for (const url of playerUrls) {
        if (isStreamUrl(url)) {
          setCache(cacheKey, url);
          await saveToDb(tmdbId, url, sourceName, category);
          return { url, source: sourceName };
        }
      }
    }
  }
  return null;
}

async function resolveCinemana(tmdbId: string, title: string): Promise<ResolveResult | null> {
  return trySite(tmdbId, title, 'https://cinemana.cc', '/?s=', 'cinemana.cc', 'arabic');
}

async function resolveHd1(tmdbId: string, title: string): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:hd1`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const searchData = await httpPost('https://hd1.brstej.com/ajax-search.php', new URLSearchParams({ q: title }), { 'X-Requested-With': 'XMLHttpRequest' });
  if (!searchData) return null;

  const vidMatch = searchData.match(/vid=([a-f0-9]{8,12})/);
  if (!vidMatch) return null;

  const embedUrl = `https://hd1.brstej.com/embed.php?vid=${vidMatch[1]}`;
  const embedHtml = await httpGet(embedUrl);
  if (embedHtml) {
    const urls = extractUrls(embedHtml, embedUrl);
    for (const url of urls) {
      if (isStreamUrl(url)) {
        setCache(cacheKey, url);
        await saveToDb(tmdbId, url, 'hd1.brstej.com', 'arabic');
        return { url, source: 'hd1.brstej.com' };
      }
    }
  }
  setCache(cacheKey, embedUrl);
  await saveToDb(tmdbId, embedUrl, 'hd1.brstej.com', 'arabic');
  return { url: embedUrl, source: 'hd1.brstej.com' };
}

async function resolveFaselHD(tmdbId: string, title: string): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:faselhd`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const domains = ['https://www.faselhd.club', 'https://www.faselhds.com', 'https://www.faselhd.is'];
  for (const base of domains) {
    const result = await trySite(tmdbId, title, base, '/?s=', 'faselhd.com', 'arabic');
    if (result) return result;
  }
  return null;
}

async function resolveMyCima(tmdbId: string, title: string): Promise<ResolveResult | null> {
  return trySite(tmdbId, title, 'https://mycima.video', '/search/', 'mycima.video', 'arabic');
}

async function resolveCimaClub(tmdbId: string, title: string): Promise<ResolveResult | null> {
  return trySite(tmdbId, title, 'https://cimaclub.cc', '/?s=', 'cimaclub.cc', 'arabic');
}

async function resolveArabSeed(tmdbId: string, title: string): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:arabseed`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const domains = ['https://arabseed.cam', 'https://web.arabseed.mobi', 'https://abseed.vip'];
  for (const base of domains) {
    const result = await trySite(tmdbId, title, base, '/?s=', 'arabseed.cam', 'arabic');
    if (result) return result;
  }
  return null;
}

async function resolveQissat(tmdbId: string, title: string): Promise<ResolveResult | null> {
  return trySite(tmdbId, title, 'https://ar.qissat.tv', '/?s=', 'ar.qissat.tv', 'turkish');
}

async function resolveHDFilm(tmdbId: string, title: string): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:hdfilm`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  const domains = ['https://hdfilmcehennemi.sh', 'https://hdfilmcehennemi.com', 'https://www.hdfilmcehennemi.net'];
  for (const base of domains) {
    const result = await trySite(tmdbId, title, base, `/search/${encodeURIComponent(slug)}`, 'hdfilmcehennemi.sh', 'turkish');
    if (result) return result;
  }
  return null;
}

async function resolveDizipal(tmdbId: string, title: string): Promise<ResolveResult | null> {
  const cacheKey = `${tmdbId}:dizipal`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const domains = ['https://dizipal104.vip', 'https://dizipal105.vip', 'https://dizipal106.vip', 'https://dizipal107.vip'];
  for (const base of domains) {
    const result = await trySite(tmdbId, title, base, `/search/${encodeURIComponent(slug)}`, 'dizipal', 'turkish');
    if (result) return result;
  }
  return null;
}

export async function resolveProvider(tmdbId: string, category: string = 'arabic'): Promise<ResolveResult | null> {
  try {
    const LinkModel = await getLinkModel();
    const existing = await LinkModel.findOne({ tmdb_id: tmdbId, is_active: true }).sort({ last_checked: -1 });
    if (existing && (existing as any).embed_url) {
      return { url: (existing as any).embed_url, source: (existing as any).source || 'db-cache' };
    }
  } catch { /* DB unavailable */ }

  const resultKey = `resolved:${tmdbId}`;
  const cachedResult = resultCache.get(resultKey);
  if (cachedResult && Date.now() - cachedResult.ts < CACHE_TTL) {
    return { url: cachedResult.url, source: 'memory-cache' };
  }

  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  const scrapers = category === 'turkish'
    ? [resolveQissat, resolveHDFilm, resolveDizipal]
    : [resolveCinemana, resolveHd1, resolveFaselHD, resolveMyCima, resolveCimaClub, resolveArabSeed];

  const results = await Promise.allSettled(scrapers.map(fn => fn(tmdbId, title)));
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      resultCache.set(resultKey, { url: r.value.url, ts: Date.now() });
      return r.value;
    }
  }
  return null;
}

export function clearCache() { titleCache.clear(); resultCache.clear(); }
export function getCacheStats() { return { titles: titleCache.size, results: resultCache.size }; }
