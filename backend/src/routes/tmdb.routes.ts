import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const TMDB_KEY = process.env.TMDB_API_KEY;

router.get('/trailer/:tmdbId', async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const mediaType = (req.query.type as string) || 'movie';
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/videos?api_key=${TMDB_KEY}&language=ar-SA`,
      { timeout: 8000 }
    );
    const trailer =
      data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
      data.results?.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
      data.results?.find((v: any) => v.site === 'YouTube');
    res.json({ key: trailer?.key || null });
  } catch {
    res.json({ key: null });
  }
});

router.get('/details/:tmdbId', async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`,
      { timeout: 8000 }
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

router.get('/tv-details/:tmdbId', async (req: Request, res: Response) => {
  try {
    const tmdbId = String(req.params.tmdbId);
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`,
      { timeout: 8000 }
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

export default router;
