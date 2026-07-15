import { Request, Response } from 'express';
import Link from '../models/Link.model';

export async function getStreamsByTmdb(req: Request, res: Response) {
  try {
    const { tmdb_id } = req.params;
    const category = req.query.category as string;

    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    const filter: any = {
      tmdb_id: String(tmdb_id),
      is_active: true,
    };

    if (category) {
      filter.category = category;
    }

    const links = await Link.find(filter)
      .sort({ quality: -1, last_checked: -1 })
      .limit(20);

    const streams = links.map((link) => ({
      url: link.stream_url || link.embed_url,
      source: link.source,
      quality: link.quality,
      category: link.category,
      title: link.title,
      last_checked: link.last_checked,
    }));

    return res.json({ streams, count: streams.length });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllStreams(req: Request, res: Response) {
  try {
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const filter: any = { is_active: true };
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
    const { tmdb_id } = req.params;
    const links = await Link.find({ tmdb_id: String(tmdb_id), is_active: true });

    const health = links.map((link) => ({
      url: link.stream_url || link.embed_url,
      source: link.source,
      quality: link.quality,
      last_checked: link.last_checked,
      age_hours: Math.round((Date.now() - link.last_checked.getTime()) / (1000 * 60 * 60)),
    }));

    return res.json({ tmdb_id, streams: health });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
