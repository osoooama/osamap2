import { Router } from 'express';
import { getMovies, getMovieDetails, triggerScrape } from '../controllers/movie.controller';

const router = Router();
router.get('/movies/:category', getMovies);
router.get('/movie/:tmdb_id', getMovieDetails);
router.post('/scrape/trigger', triggerScrape);

export default router;
