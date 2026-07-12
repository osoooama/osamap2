import { Router } from 'express';
import {
  getMoviesByCategory,
  getMovieDetails,
  searchMovies,
  seedDatabase,
  seedCategory,
  resolveMovieProvider,
} from '../controllers/movie.controller';

const router = Router();
router.get('/movies/category/:category', getMoviesByCategory);
router.get('/movies/details/:tmdb_id', getMovieDetails);
router.get('/movies/search', searchMovies);
router.post('/movies/seed', seedDatabase);
router.post('/movies/seed/:category', seedCategory);
router.get('/movies/resolve-provider/:tmdb_id', resolveMovieProvider);

export default router;
