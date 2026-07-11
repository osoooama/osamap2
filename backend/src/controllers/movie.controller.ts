import { Request, Response } from 'express';
import Movie from '../models/Movie.model';
import Link from '../models/Link.model';
import * as tmdb from '../services/tmdb.service';

export async function getMoviesByCategory(req: Request, res: Response) {
  try {
    const category = req.params.category as string;
    let movies = await Movie.find({ category: category as any }).sort({ created_at: -1 }).limit(50);

    if (movies.length === 0) {
      const tmdbResults = await tmdb.discoverByCategory(category);
      const docs = tmdbResults.map((item: any) => ({
        tmdb_id: String(item.id),
        title: item.title || item.name || 'Unknown',
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        category,
        images: { tmdb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '' },
      }));
      if (docs.length > 0) {
        await Movie.insertMany(docs, { ordered: false }).catch(() => {});
        movies = await Movie.find({ category: category as any }).sort({ created_at: -1 }).limit(50);
      }
    }

    const enriched = movies.map((m) => {
      const obj = m.toObject();
      const image = obj.images?.tmdb || obj.poster_path || '';
      return { ...obj, poster: image };
    });

    res.json(enriched);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch movies';
    res.status(500).json({ error: message });
  }
}

export async function getMovieDetails(req: Request, res: Response) {
  try {
    const tmdb_id = req.params.tmdb_id as string;
    let movie = await Movie.findOne({ tmdb_id });

    if (!movie) {
      const tmdbData = await tmdb.getMovieDetails(tmdb_id);
      movie = await Movie.create({
        tmdb_id,
        title: tmdbData.title,
        overview: tmdbData.overview,
        poster_path: tmdbData.poster_path,
        backdrop_path: tmdbData.backdrop_path,
      });
    }

    const links = await Link.find({ tmdb_id, is_active: true });

    const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };
    const sorted = [...links].sort((a: any, b: any) => (qualityRank[b.quality] || 0) - (qualityRank[a.quality] || 0));

    const seen = new Set<string>();
    const uniqueSources: any[] = [];
    const allUrls = new Set<string>();
    for (const l of sorted) {
      const url = (l as any).embed_url || '';
      if (url && !seen.has(url)) {
        seen.add(url);
        uniqueSources.push(l);
        allUrls.add(url);
      }
    }

    const result: any = { ...movie.toObject(), links: uniqueSources };
    result.embed_urls = [...allUrls];

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch movie details';
    res.status(500).json({ error: message });
  }
}

export async function searchMovies(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) return res.json([]);

    const local = await Movie.find({ $text: { $search: q } }).limit(20);

    let tmdbResults: any[] = [];
    try {
      const { data } = await import('axios').then(a =>
        a.default.get('https://api.themoviedb.org/3/search/movie', {
          params: { api_key: process.env.TMDB_API_KEY, query: q, language: 'ar' },
        })
      );
      tmdbResults = (data.results || []).slice(0, 10);
    } catch {
      // TMDB fallback silently
    }

    res.json({ local, tmdb: tmdbResults });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    res.status(500).json({ error: message });
  }
}
