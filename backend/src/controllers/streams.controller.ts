import { Request, Response } from 'express';
import Link from '../models/Link.model';
import { getAllEmbedSources } from '../services/embed.service';
import { resolveProvider } from '../services/provider-resolver.service';

export async function getStreamsByTmdb(req: Request, res: Response) {
  try {
    const tmdb_id = String(req.params.tmdb_id);
    const category = req.query.category as string;
    const mediaType = (req.query.type as string) || 'movie';
    const season = req.query.season ? parseInt(req.query.season as string) : undefined;
    const episode = req.query.episode ? parseInt(req.query.episode as string) : undefined;

    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    const filter: Record<string, unknown> = {
      tmdb_id,
      is_active: true,
    };

    if (category) {
      filter.category = category;
    }

    const links = await Link.find(filter)
      .sort({ quality: -1, last_checked: -1 })
      .limit(20);

    const dbStreams = links.map((link) => ({
      url: link.stream_url || link.embed_url,
      source: link.source,
      quality: link.quality,
      category: link.category,
      title: link.title,
      type: 'embed' as const,
      last_checked: link.last_checked,
    }));

    const embedSources = await getAllEmbedSources(tmdb_id, mediaType as 'movie' | 'tv', season, episode);

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

export async function resolveStream(req: Request, res: Response) {
  try {
    const tmdb_id = String(req.params.tmdb_id);
    const provider = String(req.query.provider);

    if (!tmdb_id || !provider) {
      return res.status(400).json({ error: 'tmdb_id and provider are required' });
    }

    const url = await resolveProvider(tmdb_id, provider);
    if (!url) {
      return res.status(404).json({ error: 'No stream found' });
    }

    return res.json({ url, provider, tmdb_id });
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

    const links = await Link.find(filter)
      .sort({ last_checked: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
