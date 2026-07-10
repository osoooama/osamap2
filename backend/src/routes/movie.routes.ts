import { Router } from 'express';
import { getMoviesByCategory, getMovieDetails, searchMovies } from '../controllers/movie.controller';

const router = Router();
router.get('/movies/category/:category', getMoviesByCategory);
router.get('/movies/details/:tmdb_id', getMovieDetails);
router.get('/movies/search', searchMovies);

export default router;
