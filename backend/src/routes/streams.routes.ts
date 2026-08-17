import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { getStreamsByTmdb, getAllStreams, checkStreamHealth, resolveStream, searchStreams } from '../controllers/streams.controller';

const router = Router();

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/streams/search', generalLimiter, searchStreams);
router.get('/streams/:tmdb_id', generalLimiter, getStreamsByTmdb);
router.get('/streams', generalLimiter, getAllStreams);
router.get('/streams/:tmdb_id/health', generalLimiter, checkStreamHealth);
router.get('/streams/:tmdb_id/resolve', generalLimiter, resolveStream);

router.get('/proxy', async (req, res) => {
  try {
    const url = String(req.query.url || '');
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    const isM3u8 = url.includes('.m3u8');
    const resp = await axios.get(url, {
      responseType: isM3u8 ? 'text' : 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': new URL(url).origin + '/',
        'Origin': new URL(url).origin,
      },
      timeout: 15000,
      maxRedirects: 5,
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (isM3u8) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      let body = resp.data;
      if (typeof body === 'string') {
        const origin = new URL(url).origin;
        body = body.replace(/(^(?!#).+\.m3u8.*$)/gm, (match: string) => {
          if (match.startsWith('http')) return `/api/proxy?url=${encodeURIComponent(match)}`;
          if (match.startsWith('/')) return `/api/proxy?url=${encodeURIComponent(origin + match)}`;
          return `/api/proxy?url=${encodeURIComponent(new URL(match, url).href)}`;
        });
        body = body.replace(/(^(?!#).+\.ts.*$)/gm, (match: string) => {
          if (match.startsWith('http')) return match;
          if (match.startsWith('/')) return origin + match;
          return new URL(match, url).href;
        });
      }
      return res.send(body);
    }
    res.setHeader('Content-Type', (resp.headers['content-type'] as string) || 'application/octet-stream');
    resp.data.pipe(res);
  } catch (error: any) {
    console.error('Proxy error:', error?.message);
    return res.status(502).json({ error: 'Proxy fetch failed' });
  }
});

export default router;
