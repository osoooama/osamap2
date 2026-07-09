CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id TEXT UNIQUE,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  category TEXT CHECK (category IN ('foreign','arabic','turkish','anime','animation')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES movies(id),
  source_site TEXT,
  embed_url TEXT,
  quality TEXT CHECK (quality IN ('720p','1080p','4K')),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  movie_id UUID REFERENCES movies(id),
  platform TEXT CHECK (platform IN ('netflix','shahid','disney','crunchyroll')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read movies" ON movies FOR SELECT TO anon USING (true);
CREATE POLICY "auth write favorites" ON favorites FOR ALL TO authenticated USING (true);
