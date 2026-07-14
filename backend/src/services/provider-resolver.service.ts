import axios from 'axios';
import mongoose from 'mongoose';

const CINEMANA_BASE = 'https://cinemana.cc';
const HD1_BASE = 'https://hd1.brstej.com';
const ANIME3RB_BASE = 'https://anime3rb.com';

const TMDB_KEY = process.env.TMDB_API_KEY || 'b4905ea858601abd0565baa117b69b24';
const TMDB_BASE = 'https://api.themoviedb.org/3';

let Link: mongoose.Model<any>;
async function getLinkModel() {
  if (!Link) Link = (await import('../models/Link.model')).default;
  return Link;
}

async function getTmdbTitle(tmdbId: string): Promise<string | null> {
  if (!/^\d+$/.test(tmdbId)) return null;
  try {
    const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}`, { timeout: 8000 });
    return data.title || data.original_title || null;
  } catch {
    try {
      const { data } = await axios.get(`${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}`, { timeout: 8000 });
      return data.name || data.original_name || null;
    } catch {
      return null;
    }
  }
}

function extractUrl(text: string): string | null {
  const patterns = [
    /href=["']([^"']*(?:watch|play|movie|episode|embed)[^"']*\d+[^"']*)["']/i,
    /<a[^>]*href=["']([^"']+)["'][^>]*>/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return m[1];
  }
  return null;
}

export async function resolveCinemana(tmdbId: string): Promise<string | null> {
  const LinkModel = await getLinkModel();
  const existing = await LinkModel.findOne({ tmdb_id: tmdbId, is_active: true, source: /cinemana/i });
  if (existing) return (existing as any).embed_url;

  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  const queries = [title, title.replace(/[:\-'].*$/, '').trim()];
  for (const q of queries) {
    try {
      const { data } = await axios.get(`${CINEMANA_BASE}/?s=${encodeURIComponent(q)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': CINEMANA_BASE }, timeout: 10000,
      });
      const href = extractUrl(data);
      if (href) {
        const url = href.startsWith('http') ? href : `${CINEMANA_BASE}${href}`;
        await LinkModel.updateOne({ embed_url: url }, {
          $set: { tmdb_id: tmdbId, embed_url: url, source: `cinemana.cc/search?q=${q}`, category: 'arabic', platform: 'shahid', is_active: true, last_checked: new Date() },
        }, { upsert: true }).catch(() => {});
        return url;
      }
    } catch { continue; }
  }
  return null;
}

export async function resolveHd1(tmdbId: string): Promise<string | null> {
  const LinkModel = await getLinkModel();
  const existing = await LinkModel.findOne({ tmdb_id: tmdbId, is_active: true, source: /hd1/i });
  if (existing) return (existing as any).embed_url;

  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  try {
    const { data } = await axios.post(`${HD1_BASE}/ajax-search.php`,
      new URLSearchParams({ q: title }),
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': HD1_BASE, 'X-Requested-With': 'XMLHttpRequest' }, timeout: 10000 }
    );
    const m = data.match(/vid=([a-f0-9]{9})/);
    if (m) {
      const url = `${HD1_BASE}/embed.php?vid=${m[1]}`;
      await LinkModel.updateOne({ embed_url: url }, {
        $set: { tmdb_id: tmdbId, embed_url: url, source: `hd1.brstej.com/search?q=${title}`, category: 'arabic', platform: 'shahid', is_active: true, last_checked: new Date() },
      }, { upsert: true }).catch(() => {});
      return url;
    }
  } catch {}
  return null;
}

export async function resolveAnime3rb(tmdbId: string): Promise<string | null> {
  const LinkModel = await getLinkModel();
  const existing = await LinkModel.findOne({ tmdb_id: tmdbId, is_active: true, source: /anime3rb|vid3rb/i });
  if (existing) return (existing as any).embed_url;

  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  let slug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const slugVariants = [slug];
  if (slug.includes('--')) slugVariants.push(slug.replace(/--+/g, '-'));
  const specialCases: Record<string, string> = {
    'one-piece': 'one-piece',
    'naruto-shippuden': 'naruto-shippuuden',
    'naruto': 'naruto',
    'demon-slayer': 'demon-slayer-kimetsu-no-yaiba',
    'attack-on-titan': 'attack-on-titan',
  };
  if (specialCases[slug]) slugVariants.push(specialCases[slug]);

  for (const s of slugVariants) {
    try {
      const epUrl = `${ANIME3RB_BASE}/episode/${s}/1`;
      const { data } = await axios.get(epUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': ANIME3RB_BASE }, timeout: 8000,
      });
      const m = data.match(/<iframe[^>]*src=["']([^"']*vid3rb[^"']*)["']/);
      if (m) {
        const url = m[1].startsWith('http') ? m[1] : `https:${m[1]}`;
        await LinkModel.updateOne({ embed_url: url }, {
          $set: { tmdb_id: tmdbId, embed_url: url, source: epUrl, category: 'anime', platform: 'crunchyroll', is_active: true, last_checked: new Date() },
        }, { upsert: true }).catch(() => {});
        return url;
      }
    } catch { continue; }
  }
  return null;
}

export async function resolveProvider(tmdbId: string, provider: string): Promise<string | null> {
  const LinkModel = await getLinkModel();
  const existing = await LinkModel.findOne({ tmdb_id: tmdbId, is_active: true }).sort({ last_checked: -1 });
  if (existing) return (existing as any).embed_url;

  switch (provider) {
    case 'cinemana': return resolveCinemana(tmdbId);
    case 'hd1': return resolveHd1(tmdbId);
    case 'anime3rb': return resolveAnime3rb(tmdbId);
    default: return null;
  }
}
