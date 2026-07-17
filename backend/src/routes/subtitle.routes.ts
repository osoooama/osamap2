import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Movie from '../models/Movie.model';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

const WYZIE_KEY = process.env.WYZIE_API_KEY || '';
const WYZIE_BASE = 'https://sub.wyzie.io/search';

interface WyzieSubtitle {
  id: string;
  url: string;
  flagUrl: string;
  format: string;
  encoding: string;
  language: string;
  source: string;
}

const LANG_NAMES: Record<string, string> = {
  ar: 'Arabic', en: 'English', tr: 'Turkish', fr: 'French',
  es: 'Spanish', de: 'German', pt: 'Portuguese', ja: 'Japanese',
  ko: 'Korean', zh: 'Chinese', it: 'Italian', ru: 'Russian',
  hi: 'Hindi', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian',
  pl: 'Polish', nl: 'Dutch', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', el: 'Greek', he: 'Hebrew',
  cs: 'Czech', ro: 'Romanian', hu: 'Hungarian', uk: 'Ukrainian',
  pb: 'Portuguese (BR)',
};

async function fetchSubtitles(tmdbId: string, mediaType: string, season?: number, episode?: number, language?: string): Promise<WyzieSubtitle[]> {
  if (!WYZIE_KEY) return [];

  const params = new URLSearchParams({ id: tmdbId, key: WYZIE_KEY });
  if (mediaType === 'tv' && season && episode) {
    params.set('season', String(season));
    params.set('episode', String(episode));
  }
  if (language) params.set('language', language);

  try {
    const resp = await fetch(`${WYZIE_BASE}?${params}`, {
      headers: { 'User-Agent': 'OSK-Plus/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function pickBest(subs: WyzieSubtitle[]): WyzieSubtitle[] {
  const PRIORITY = ['ar', 'en', 'tr', 'fr', 'es', 'de', 'pt', 'ja'];
  const scored = subs.map(s => {
    const idx = PRIORITY.indexOf(s.language);
    const score = idx >= 0 ? 100 - idx : 0;
    return { score, sub: s };
  }).sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: WyzieSubtitle[] = [];
  for (const { sub } of scored) {
    if (!seen.has(sub.language) && result.length < 10) {
      seen.add(sub.language);
      result.push(sub);
    }
  }
  return result;
}

function formatSubs(subs: WyzieSubtitle[]) {
  return subs.map(s => ({
    lang: s.language,
    lang_name: LANG_NAMES[s.language] || s.language.toUpperCase(),
    url: s.url,
    format: s.format || 'srt',
    encoding: s.encoding || 'utf-8',
    source: s.source || '',
    flag_url: s.flagUrl || '',
  }));
}

router.get('/subtitles/:tmdbId', limiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const mediaType = (req.query.type as string) || 'movie';
    const season = req.query.season ? Number(req.query.season) : undefined;
    const episode = req.query.episode ? Number(req.query.episode) : undefined;

    const movie = await Movie.findOne({ tmdb_id: tmdbId });
    if (movie && (movie as any).subtitles && (movie as any).subtitles.length > 0) {
      return res.json({ subtitles: (movie as any).subtitles, source: 'cache' });
    }

    const subs = await fetchSubtitles(tmdbId, mediaType, season, episode);
    const best = pickBest(subs);
    const formatted = formatSubs(best);

    if (formatted.length > 0 && movie) {
      await Movie.updateOne(
        { tmdb_id: tmdbId },
        { $set: { subtitles: formatted } }
      );
    }

    res.json({ subtitles: formatted, source: 'wyzie' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch subtitles';
    res.status(500).json({ error: message });
  }
});

export default router;
