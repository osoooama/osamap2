import { Request, Response } from 'express';
import Movie from '../models/Movie.model';
import Link from '../models/Link.model';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const movies = await Movie.find({ category: category as any }).sort({ created_at: -1 }).limit(50);
    res.json(movies);
  } catch (err) {
    console.error('getMovies error:', err);
    res.status(500).json({ error: 'فشل في جلب الأفلام' });
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const { tmdb_id } = req.params;
    const movie = await Movie.findOne({ tmdb_id: tmdb_id as any });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    const links = await Link.find({ movie_id: movie._id as any, is_active: true as any });
    res.json({ ...movie.toObject(), links });
  } catch (err) {
    console.error('getMovieDetails error:', err);
    res.status(500).json({ error: 'فشل في جلب تفاصيل الفيلم' });
  }
};

export const triggerScrape = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Scrape triggered' });
  } catch (err) {
    console.error('triggerScrape error:', err);
    res.status(500).json({ error: 'فشل في تشغيل السكرابر' });
  }
};
