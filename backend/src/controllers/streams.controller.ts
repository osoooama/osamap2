import { Request, Response } from 'express';
import Link from '../models/Link.model';
import { getAllEmbedSources } from '../services/embed.service';
import { resolveProvider, getTmdbTitle } from '../services/provider-resolver.service';

function normalizeArabic(s: string): string {
  return s
    .replace(/[\u0622\u0623\u0625\u0649]/g, '\u0627')
    .replace(/[\u0640\u064B-\u0652\u0670]/g, '')
    .replace(/[\u0629]/g, '\u0647')
    .replace(/[\u0643\u06A9]/g, '\u0643')
    .replace(/[\u062F\u0630]/g, '\u0636')
    .replace(/[\u0638\u063A]/g, '\u063A')
    .replace(/[\u0641\u06A1]/g, '\u0641')
    .replace(/[\u0624]/g, '\u0648')
    .replace(/[\u0626]/g, '\u064A')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildFuzzyRegex(title: string): RegExp {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

function toEmbedUrl(url: string): string {
  if (!url) return url;
  if (url.includes('hd1.brstej.com/play.php')) return url.replace('play.php', 'embed.php');
  return url;
}

function formatStream(link: any) {
  const rawUrl = link.embed_url || link.stream_url || '';
  const sourceUrl = link.source || '';
  const isM3u8 = /\.m3u8(\?|$)/i.test(rawUrl);
  const url = isM3u8 ? toEmbedUrl(sourceUrl) || rawUrl : rawUrl;
  return {
    url,
    source: sourceUrl,
    quality: link.quality,
    category: link.category,
    title: link.title,
  };
}

export async function getStreamsByTmdb(req: Request, res: Response) {
  try {
    const tmdb_id = String(req.params.tmdb_id);
    const category = (req.query.category as string) || 'arabic';
    const mediaType = (req.query.type as string) || 'movie';
    const season = req.query.season ? parseInt(req.query.season as string) : undefined;
    const episode = req.query.episode ? parseInt(req.query.episode as string) : undefined;

    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    if (category === 'arabic' || category === 'turkish') {
      const linksByTmdb = await Link.find({ tmdb_id, is_active: true }).sort({ quality: -1, last_checked: -1 }).limit(10);
      if (linksByTmdb.length > 0) {
        const streams = linksByTmdb.map(formatStream);
        return res.json({ streams, count: streams.length });
      }

      const title = await getTmdbTitle(tmdb_id, mediaType);
      if (title) {
        const regex = buildFuzzyRegex(title);
        const linksByTitle = await Link.find({ title: regex, is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(10);
        if (linksByTitle.length > 0) {
          const streams = linksByTitle.map(formatStream);
          return res.json({ streams, count: streams.length });
        }

        const normalized = normalizeArabic(title);
        if (normalized !== title.toLowerCase()) {
          const linksByNormalized = await Link.find({ is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(500);
          const matched = linksByNormalized.filter(link => {
            if (!link.title) return false;
            return normalizeArabic(link.title).includes(normalized) || normalized.includes(normalizeArabic(link.title));
          }).slice(0, 10);
          if (matched.length > 0) {
            const streams = matched.map(formatStream);
            return res.json({ streams, count: streams.length });
          }
        }
      }

      const scraped = await resolveProvider(tmdb_id, category, mediaType);
      if (scraped) {
        return res.json({ streams: [{ url: scraped.url, source: scraped.source, quality: '720p', category }], count: 1 });
      }
      return res.json({ streams: [], count: 0 });
    }

    const filter: Record<string, unknown> = { tmdb_id, is_active: true };
    if (category) filter.category = category;

    const links = await Link.find(filter).sort({ quality: -1, last_checked: -1 }).limit(20);

    const dbStreams = links.map((link) => ({
      ...formatStream(link),
      type: 'embed' as const,
      last_checked: link.last_checked,
    }));

    const embedSources = await getAllEmbedSources(tmdb_id, mediaType as 'movie' | 'tv', season, episode, category);

    const seen = new Set<string>();
    const allStreams = [...dbStreams, ...embedSources].filter(s => {
      if (!s.url || seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });

    return res.json({ streams: allStreams, count: allStreams.length });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function searchStreams(req: Request, res: Response) {
  try {
    const query = String(req.query.q || '');
    const category = (req.query.category as string) || 'arabic';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    let links = await Link.find({ title: regex, is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(limit);

    if (links.length === 0 && /[\u0600-\u06FF]/.test(query)) {
      const normalizedQuery = normalizeArabic(query);
      const allLinks = await Link.find({ is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(500);
      const normalizedMatches = allLinks.filter(link => {
        if (!link.title) return false;
        const normTitle = normalizeArabic(link.title);
        return normTitle.includes(normalizedQuery) || normalizedQuery.includes(normTitle);
      }).slice(0, limit);
      links = normalizedMatches;
    }

    const streams = links.map(link => ({
      ...formatStream(link),
      tmdb_id: link.tmdb_id,
    }));

    return res.json({ streams, count: streams.length, query });
  } catch (error) {
    console.error('Error searching streams:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resolveStream(req: Request, res: Response) {
  try {
    const tmdb_id = String(req.params.tmdb_id);
    const category = (req.query.category as string) || 'arabic';

    if (!tmdb_id) {
      return res.status(400).json({ error: 'tmdb_id is required' });
    }

    const result = await resolveProvider(tmdb_id, category);
    if (!result) {
      return res.status(404).json({ error: 'No stream found' });
    }

    return res.json({ streams: [{ url: result.url, source: result.source, quality: '720p', category }], count: 1 });
  } catch (error) {
    console.error('Error resolving stream:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllStreams(req: Request, res: Response) {
  try {
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const filter: Record<string, unknown> = { is_active: true };
    if (category) filter.category = category;

    const links = await Link.find(filter).sort({ last_checked: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Link.countDocuments(filter);

    return res.json({ streams: links, total, page, limit });
  } catch (error) {
    console.error('Error fetching all streams:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function checkStreamHealth(req: Request, res: Response) {
  try {
    const tmdb_id = String(req.params.tmdb_id);
    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    const links = await Link.find({ tmdb_id, is_active: true });
    const health = links.map((link) => ({
      url: link.stream_url || link.embed_url,
      source: link.source,
      quality: link.quality,
      last_checked: link.last_checked,
      age_hours: Math.round((Date.now() - link.last_checked.getTime()) / (1000 * 60 * 60)),
    }));

    return res.json({ tmdb_id, streams: health });
  } catch (error) {
    console.error('Error checking stream health:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
