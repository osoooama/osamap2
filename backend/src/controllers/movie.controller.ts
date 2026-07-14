import { Request, Response } from 'express';
import Movie from '../models/Movie.model';
import Link from '../models/Link.model';
import * as tmdb from '../services/tmdb.service';
import { resolveProvider } from '../services/provider-resolver.service';

const VALID_CATEGORIES = ['foreign', 'arabic', 'turkish', 'anime', 'animation'];

export async function getMoviesByCategory(req: Request, res: Response) {
  try {
    const category = req.params.category as string;
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const type = req.query.type as string; // 'movie' | 'tv' | undefined (both)

    const filter: any = { category };
    if (type === 'movie' || type === 'tv') filter.media_type = type;

    let movies = await Movie.find(filter)
      .sort({ popularity: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (movies.length === 0 && page === 1) {
      const tmdbResults = await tmdb.discoverByCategory(category);
      const docs = tmdbResults.map((item: any) => ({
        tmdb_id: item.tmdb_id,
        title: item.title || item.name || 'Unknown',
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        media_type: item.media_type || 'movie',
        category,
        images: { tmdb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '' },
        vote_average: item.vote_average || 0,
        release_date: item.release_date || item.first_air_date || '',
        genre_ids: item.genre_ids || [],
        original_language: item.original_language || '',
        popularity: item.popularity || 0,
      }));
      if (docs.length > 0) {
        await Movie.insertMany(docs, { ordered: false }).catch(() => {});
        movies = await Movie.find(filter)
          .sort({ popularity: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      }
    }

    const total = await Movie.countDocuments(filter);

    const enriched = movies.map((m) => {
      const obj = m.toObject();
      const image = obj.images?.tmdb || (obj.poster_path ? `https://image.tmdb.org/t/p/w500${obj.poster_path}` : '');
      return { ...obj, poster: image };
    });

    res.json({ items: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

export async function getMovieDetails(req: Request, res: Response) {
  try {
    const tmdb_id = req.params.tmdb_id as string;
    let movie = await Movie.findOne({ tmdb_id });

    if (!movie) {
      try {
        const tmdbData = await tmdb.getMovieDetails(tmdb_id);
        movie = await Movie.create({
          tmdb_id,
          title: tmdbData.title,
          overview: tmdbData.overview,
          poster_path: tmdbData.poster_path,
          backdrop_path: tmdbData.backdrop_path,
          media_type: 'movie',
          vote_average: tmdbData.vote_average || 0,
          release_date: tmdbData.release_date || '',
          genre_ids: tmdbData.genres?.map((g: any) => g.id) || [],
          original_language: tmdbData.original_language || '',
          popularity: tmdbData.popularity || 0,
        });
      } catch {
        try {
          const tmdbData = await tmdb.getTVDetails(tmdb_id);
          movie = await Movie.create({
            tmdb_id,
            title: tmdbData.name,
            overview: tmdbData.overview,
            poster_path: tmdbData.poster_path,
            backdrop_path: tmdbData.backdrop_path,
            media_type: 'tv',
            vote_average: tmdbData.vote_average || 0,
            release_date: tmdbData.first_air_date || '',
            genre_ids: tmdbData.genres?.map((g: any) => g.id) || [],
            original_language: tmdbData.original_language || '',
            popularity: tmdbData.popularity || 0,
          });
        } catch {
          return res.status(404).json({ error: 'Content not found' });
        }
      }
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

    if (movie.media_type === 'tv') {
      try {
        const tvData = await tmdb.getTVDetails(tmdb_id);
        result.seasons = (tvData.seasons || []).map((s: any) => ({
          season_number: s.season_number,
          episode_count: s.episode_count,
          name: s.name,
          poster_path: s.poster_path,
        }));
        result.number_of_seasons = tvData.number_of_seasons;
        result.number_of_episodes = tvData.number_of_episodes;
        result.status = tvData.status;
        result.last_air_date = tvData.last_air_date;
      } catch {
        // season data optional
      }
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch movie details';
    res.status(500).json({ error: message });
  }
}

export async function resolveMovieProvider(req: Request, res: Response) {
  try {
    const tmdbId = req.params.tmdb_id as string;
    const provider = req.query.provider as string;
    if (!tmdbId || !provider) {
      return res.status(400).json({ error: 'tmdb_id and provider are required' });
    }
    const url = await resolveProvider(tmdbId, provider);
    res.json({ url, provider, tmdb_id: tmdbId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resolve provider';
    res.status(500).json({ error: message });
  }
}

export async function searchMovies(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) return res.json([]);

    const local = await Movie.find({ $text: { $search: q } }).limit(20);
    const tmdbResults = await tmdb.searchTMDB(q);

    res.json({ local, tmdb: tmdbResults });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    res.status(500).json({ error: message });
  }
}

export async function seedDatabase(req: Request, res: Response) {
  try {
    const categories = ['foreign', 'arabic', 'turkish', 'anime', 'animation'];

    for (const category of categories) {
      const results = await tmdb.seedCategoryFull(category, 10);
      const docs = results.map((item: any) => ({
        tmdb_id: item.tmdb_id,
        title: item.title || item.name || 'Unknown',
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        media_type: item.media_type || 'movie',
        category,
        images: { tmdb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '' },
        vote_average: item.vote_average || 0,
        release_date: item.release_date || '',
        genre_ids: item.genre_ids || [],
        original_language: item.original_language || '',
        popularity: item.popularity || 0,
      }));

      for (const doc of docs) {
        await Movie.updateOne({ tmdb_id: doc.tmdb_id }, { $set: doc }, { upsert: true });
      }
    }

    const counts = await Promise.all(
      categories.map(async (c) => {
        const count = await Movie.countDocuments({ category: c as any });
        return `${c}: ${count}`;
      })
    );

    res.json({ message: 'Seed complete', counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed';
    res.status(500).json({ error: message });
  }
}

export async function seedCategory(req: Request, res: Response) {
  try {
    const category = req.params.category as string;
    const maxPages = parseInt(req.query.pages as string) || 10;

    const results = await tmdb.seedCategoryFull(category, maxPages);
    const docs = results.map((item: any) => ({
      tmdb_id: item.tmdb_id,
      title: item.title || item.name || 'Unknown',
      overview: item.overview || '',
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      media_type: item.media_type || 'movie',
      category,
      images: { tmdb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '' },
      vote_average: item.vote_average || 0,
      release_date: item.release_date || '',
      genre_ids: item.genre_ids || [],
      original_language: item.original_language || '',
      popularity: item.popularity || 0,
    }));

    for (const doc of docs) {
      await Movie.updateOne({ tmdb_id: doc.tmdb_id }, { $set: doc }, { upsert: true });
    }

    const count = await Movie.countDocuments({ category: category as any });
    res.json({ message: `Seed complete for ${category}`, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed';
    res.status(500).json({ error: message });
  }
}
