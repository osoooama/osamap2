import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

export default router;
