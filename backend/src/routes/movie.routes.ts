import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth';
import {
  getMoviesByCategory,
  getMovieDetails,
  searchMovies,
  seedDatabase,
  seedCategory,
  resolveMovieProvider,
} from '../controllers/movie.controller';

const router = Router();

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const seedLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.get('/movies/category/:category', generalLimiter, getMoviesByCategory);
router.get('/movies/details/:tmdb_id', generalLimiter, getMovieDetails);
router.get('/movies/search', generalLimiter, searchMovies);
router.post('/movies/seed', seedLimiter, authenticate, seedDatabase);
router.post('/movies/seed/:category', seedLimiter, authenticate, seedCategory);
router.get('/movies/resolve-provider/:tmdb_id', generalLimiter, resolveMovieProvider);

export default router;
