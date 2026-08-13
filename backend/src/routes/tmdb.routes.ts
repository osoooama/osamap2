import { Router, Request, Response } from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = Router();
const tmdbLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const TMDB_KEY = process.env.TMDB_API_KEY;

router.get('/trailer/:tmdbId', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const mediaType = (req.query.type as string) || 'movie';
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/videos`,
      { params: { api_key: TMDB_KEY, language: 'ar-SA' }, timeout: 8000 }
    );
    const trailer =
      data.results?.find((v: Record<string, string>) => v.type === 'Trailer' && v.site === 'YouTube') ||
      data.results?.find((v: Record<string, string>) => v.type === 'Teaser' && v.site === 'YouTube') ||
      data.results?.find((v: Record<string, string>) => v.site === 'YouTube');
    res.json({ key: trailer?.key || null });
  } catch {
    res.json({ key: null });
  }
});

router.get('/details/:tmdbId', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      { params: { api_key: TMDB_KEY, language: 'ar-SA' }, timeout: 8000 }
    );
    res.json({
      runtime: data.runtime,
      genres: data.genres,
      seasons: data.seasons,
      episode_count: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
    });
  } catch {
    res.json({});
  }
});

router.get('/tv-details/:tmdbId', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdbId}`,
      { params: { api_key: TMDB_KEY, language: 'ar-SA' }, timeout: 8000 }
    );
    res.json({
      runtime: data.episode_run_time?.[0] || 0,
      genres: data.genres,
      seasons: data.seasons,
      episode_count: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
    });
  } catch {
    res.json({});
  }
});

router.get('/trending/:category/:timeWindow', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const { category, timeWindow } = req.params;
    const language = (req.query.language as string) || 'ar';
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/trending/${category}/${timeWindow}`,
      { params: { api_key: TMDB_KEY, language }, timeout: 8000 }
    );
    res.json(data);
  } catch {
    res.json({ results: [] });
  }
});

router.get('/top-rated/:category', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const language = (req.query.language as string) || 'ar';
    const page = req.query.page || 1;
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/${category}/top_rated`,
      { params: { api_key: TMDB_KEY, language, page }, timeout: 8000 }
    );
    res.json(data);
  } catch {
    res.json({ results: [] });
  }
});

router.get('/search/:category', tmdbLimiter, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const query = req.query.q as string;
    const language = (req.query.language as string) || 'ar';
    if (!query) return res.json({ results: [] });
    const endpoint = category === 'multi' ? 'search/multi' : `search/${category}`;
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/${endpoint}`,
      { params: { api_key: TMDB_KEY, language, query }, timeout: 8000 }
    );
    res.json(data);
  } catch {
    res.json({ results: [] });
  }
});

export default router;
