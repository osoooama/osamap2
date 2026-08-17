import { Request, Response } from 'express';
import Link from '../models/Link.model';
import { getAllEmbedSources } from '../services/embed.service';
import { resolveProvider, getTmdbTitle } from '../services/provider-resolver.service';

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
        const streams = linksByTmdb.map(link => ({
          url: link.embed_url || link.stream_url,
          source: link.source,
          quality: link.quality,
          category: link.category,
          title: link.title,
        }));
        return res.json({ streams, count: streams.length });
      }

      const title = await getTmdbTitle(tmdb_id);
      if (title) {
        const regex = new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const linksByTitle = await Link.find({ title: regex, is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(10);
        if (linksByTitle.length > 0) {
          const streams = linksByTitle.map(link => ({
            url: link.embed_url || link.stream_url,
            source: link.source,
            quality: link.quality,
            category: link.category,
            title: link.title,
          }));
          return res.json({ streams, count: streams.length });
        }
      }

      const scraped = await resolveProvider(tmdb_id, category);
      if (scraped) {
        return res.json({ streams: [{ url: scraped.url, source: scraped.source, quality: '720p', category }], count: 1 });
      }
      return res.json({ streams: [], count: 0 });
    }

    const filter: Record<string, unknown> = { tmdb_id, is_active: true };
    if (category) filter.category = category;

    const links = await Link.find(filter).sort({ quality: -1, last_checked: -1 }).limit(20);

    const dbStreams = links.map((link) => ({
      url: link.stream_url || link.embed_url,
      source: link.source,
      quality: link.quality,
      category: link.category,
      title: link.title,
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

    const regex = new RegExp(query, 'i');
    const links = await Link.find({ title: regex, is_active: true, category }).sort({ quality: -1, last_checked: -1 }).limit(limit);

    const streams = links.map(link => ({
      url: link.embed_url || link.stream_url,
      source: link.source,
      quality: link.quality,
      category: link.category,
      title: link.title,
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
