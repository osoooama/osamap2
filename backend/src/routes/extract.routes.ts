import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36';
const HDBOX_BASE = 'https://h5-api.aoneroom.com/wefeed-h5api-bff';
const HDBOX_SITE = 'https://123movienow.cc';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getHDboxToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const resp = await axios.get(`${HDBOX_BASE}/country-code`, {
    headers: {
      'accept': 'application/json',
      'origin': HDBOX_SITE,
      'referer': `${HDBOX_SITE}/`,
      'user-agent': MOBILE_UA,
    },
    timeout: 10000,
  });

  const setCookie = resp.headers['set-cookie'];
  if (Array.isArray(setCookie)) {
    for (const c of setCookie) {
      const m = c.match(/token=([^;]+)/);
      if (m) {
        cachedToken = m[1];
        tokenExpiry = Date.now() + 50 * 60 * 1000;
        return cachedToken!;
      }
    }
  }

  throw new Error('Could not extract HDbox token');
}

function hdboxAuthHeaders(token: string, referer = `${HDBOX_SITE}/`) {
  return {
    'accept': 'application/json',
    'x-client-info': JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }),
    'x-source': 'null',
    'origin': HDBOX_SITE,
    'referer': referer,
    'user-agent': MOBILE_UA,
    'authorization': `Bearer ${token}`,
    'cookie': `token=${token}; wefeed_token=%22${token}%22; wefeed_i18n_lang=en`,
  };
}

async function searchHDbox(token: string, keyword: string, subjectType: number) {
  const resp = await axios.post(`${HDBOX_BASE}/subject/search`,
    { keyword, page: 1, perPage: 10, subjectType },
    {
      headers: { ...hdboxAuthHeaders(token), 'content-type': 'application/json; charset=utf-8' },
      timeout: 10000,
    }
  );
  return resp.data?.data?.items || [];
}

async function getHDboxDetail(token: string, detailPath: string) {
  const resp = await axios.get(`${HDBOX_BASE}/detail?detailPath=${detailPath}`, {
    headers: hdboxAuthHeaders(token),
    timeout: 10000,
  });
  return resp.data?.data?.subject || {};
}

async function getHDboxPlay(token: string, subjectId: string, se: number, ep: number, detailPath: string) {
  const referer = `${HDBOX_SITE}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${se}&detailEp=${ep}&lang=en`;
  const resp = await axios.get(
    `${HDBOX_SITE}/wefeed-h5api-bff/subject/play?subjectId=${subjectId}&se=${se}&ep=${ep}&detailPath=${detailPath}`,
    { headers: hdboxAuthHeaders(token, referer), timeout: 10000 }
  );
  return resp.data?.data || {};
}

async function getHDboxCaptions(token: string, streamId: string, subjectId: string, detailPath: string) {
  try {
    const referer = `${HDBOX_SITE}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=0&detailEp=0&lang=en`;
    const resp = await axios.get(
      `${HDBOX_SITE}/wefeed-h5api-bff/subject/caption?format&id=${streamId}&subjectId=${subjectId}&detailPath=${detailPath}`,
      { headers: hdboxAuthHeaders(token, referer), timeout: 10000 }
    );
    return resp.data?.data?.captions || [];
  } catch {
    return [];
  }
}

function sanitizeTitle(title: string): string {
  return (title || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function matchBestResult(items: any[], searchTitle: string, year?: string): any | null {
  const clean = sanitizeTitle(searchTitle);
  for (const item of items) {
    const itemTitle = sanitizeTitle(item.title || '');
    if (itemTitle.includes(clean) || clean.includes(itemTitle)) {
      if (year && item.releaseDate && item.releaseDate.length >= 4) {
        const itemYear = parseInt(item.releaseDate.substring(0, 4));
        if (Math.abs(itemYear - parseInt(year)) > 1) continue;
      }
      return item;
    }
  }
  return items[0] || null;
}

// ─── VixSrc Extractor ───
async function extractVixSrc(tmdbId: string, type: string, season?: number, episode?: number) {
  const apiPath = type === 'tv' && season && episode
    ? `/api/tv/${tmdbId}/${season}/${episode}?lang=en`
    : `/api/movie/${tmdbId}?lang=en`;

  const apiResp = await axios.get(`https://vixsrc.to${apiPath}`, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    timeout: 10000,
  });

  const src = apiResp.data?.src;
  if (!src) throw new Error('No src in VixSrc response');

  const embedUrl = `https://vixsrc.to${src.startsWith('/') ? src : '/' + src}`;
  return { url: embedUrl, referer: 'https://vixsrc.to/', source: 'vixsrc.to' };
}

// ─── Routes ───

router.get('/extract/vixsrc/:tmdbId', limiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const type = (req.query.type as string) || 'movie';
    const season = req.query.season ? Number(req.query.season) : undefined;
    const episode = req.query.episode ? Number(req.query.episode) : undefined;

    const result = await extractVixSrc(tmdbId, type, season, episode);
    res.json({ streams: [{ url: result.url, quality: '1080p' }], source: result.source });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'VixSrc extraction failed';
    res.status(500).json({ error: message });
  }
});

router.get('/extract/hdbox/:tmdbId', limiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const type = (req.query.type as string) || 'movie';
    const season = req.query.season ? Number(req.query.season) : undefined;
    const episode = req.query.episode ? Number(req.query.episode) : undefined;
    let year = req.query.year as string | undefined;
    let title = req.query.title as string | undefined;

    if (!title) {
      const tmdbKey = process.env.TMDB_API_KEY;
      if (!tmdbKey) {
        res.status(500).json({ error: 'TMDB_API_KEY not configured' });
        return;
      }
      const tmdbUrl = type === 'tv'
        ? `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbKey}`
        : `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}`;
      try {
        const tmdbResp = await axios.get(tmdbUrl, { timeout: 5000 });
        title = tmdbResp.data?.title || tmdbResp.data?.name || '';
        if (!year && tmdbResp.data?.release_date) {
          year = tmdbResp.data.release_date.substring(0, 4);
        }
      } catch {
        res.status(400).json({ error: 'Could not fetch title from TMDB' });
        return;
      }
    }

    if (!title) {
      res.status(400).json({ error: 'Could not determine title' });
      return;
    }

    const token = await getHDboxToken();
    const subjectType = type === 'tv' ? 2 : 1;
    const items = await searchHDbox(token, title, subjectType);
    if (!items.length) {
      res.status(404).json({ error: `No HDbox results for "${title}"` });
      return;
    }

    const match = matchBestResult(items, title, year);
    if (!match) {
      res.status(404).json({ error: 'No matching HDbox result found' });
      return;
    }

    const detailPath = match.detailPath;
    const subject = await getHDboxDetail(token, detailPath);
    const dubs = subject.dubs || [];

    let chosenDub: any = null;
    for (const dub of dubs) {
      if (dub.original || (dub.lanCode || '').toLowerCase() === 'en' || (dub.lanName || '').includes('Original')) {
        chosenDub = dub;
        break;
      }
    }
    if (!chosenDub && dubs.length) chosenDub = dubs[0];

    const finalSubjectId = chosenDub?.subjectId || match.subjectId || '';
    const finalDetailPath = chosenDub?.detailPath || detailPath;

    const se = type === 'tv' ? (season || 0) : 0;
    const ep = type === 'tv' ? (episode || 0) : 0;

    const playData = await getHDboxPlay(token, finalSubjectId, se, ep, finalDetailPath);
    const streams = playData.streams || [];

    if (!streams.length) {
      res.status(404).json({ error: 'HDbox: no streams available (region may be restricted)' });
      return;
    }

    const streamUrls = streams
      .filter((s: any) => s.url)
      .map((s: any) => ({
        url: s.url,
        quality: s.resolutions ? `${s.resolutions}p` : 'unknown',
      }));

    let captions: any[] = [];
    if (streamUrls.length > 0) {
      const firstStreamId = streams[0].id || '';
      captions = await getHDboxCaptions(token, firstStreamId, finalSubjectId, finalDetailPath);
    }

    const subtitleList = captions
      .filter((c: any) => c.url)
      .map((c: any) => ({
        lang: c.lan || '',
        lang_name: c.lanName || 'Unknown',
        url: c.url,
        source: 'hdbox',
      }));

    res.json({
      streams: streamUrls,
      source: 'hdbox',
      dubs: dubs.map((d: any) => ({ name: d.lanName, code: d.lanCode, subjectId: d.subjectId })),
      subtitles: subtitleList,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HDbox extraction failed';
    res.status(500).json({ error: message });
  }
});

export default router;
