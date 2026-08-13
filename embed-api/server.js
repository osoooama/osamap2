const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

const PROVIDERS = {
  movie: [
    { name: 'Showbox', buildUrl: (id) => `https://showbox.watch/embed/movie/${id}` },
    { name: 'FebBox', buildUrl: (id) => `https://febox.at/embed/movie/${id}` },
    { name: '4KHDHub', buildUrl: (id) => `https://4khdhub.com/embed/movie/${id}` },
    { name: 'VixSrc', buildUrl: (id) => `https://vixsrc.to/movie/${id}` },
    { name: 'Videasy', buildUrl: (id) => `https://videasy.net/embed/movie/${id}` },
    { name: 'Vidlink', buildUrl: (id) => `https://vidlink.pro/movie/${id}` },
    { name: 'LordFlix', buildUrl: (id) => `https://lordflix.net/embed/movie/${id}` },
    { name: 'NoTorrent', buildUrl: (id) => `https://notorrent.net/embed/movie/${id}` },
  ],
  tv: [
    { name: 'Showbox', buildUrl: (id, s, e) => `https://showbox.watch/embed/tv/${id}/${s}/${e}` },
    { name: 'FebBox', buildUrl: (id, s, e) => `https://febox.at/embed/tv/${id}/${s}/${e}` },
    { name: '4KHDHub', buildUrl: (id, s, e) => `https://4khdhub.com/embed/tv/${id}/${s}/${e}` },
    { name: 'VixSrc', buildUrl: (id, s, e) => `https://vixsrc.to/tv/${id}/${s}/${e}` },
    { name: 'Videasy', buildUrl: (id, s, e) => `https://videasy.net/embed/tv/${id}/${s}/${e}` },
    { name: 'Vidlink', buildUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { name: 'LordFlix', buildUrl: (id, s, e) => `https://lordflix.net/embed/tv/${id}/${s}/${e}` },
    { name: 'NoTorrent', buildUrl: (id, s, e) => `https://notorrent.net/embed/tv/${id}/${s}/${e}` },
  ],
};

app.get('/api/streams/:type/:tmdbId', (req, res) => {
  const { type, tmdbId } = req.params;
  const season = req.query.season ? parseInt(req.query.season) : undefined;
  const episode = req.query.episode ? parseInt(req.query.episode) : undefined;

  if (!['movie', 'tv'].includes(type)) {
    return res.status(400).json({ error: 'Type must be movie or tv' });
  }

  if (!/^\d+$/.test(tmdbId)) {
    return res.status(400).json({ error: 'Invalid TMDB ID' });
  }

  const providerList = PROVIDERS[type] || [];
  const streams = providerList.map(p => ({
    url: p.buildUrl(tmdbId, season, episode),
    provider: p.name,
    type: 'embed',
  }));

  res.json({ streams, count: streams.length });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', providers: PROVIDERS.movie.length + PROVIDERS.tv.length });
});

app.listen(PORT, () => {
  console.log(`TMDB Embed API running on port ${PORT}`);
});
