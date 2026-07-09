import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');

  if (!q) return NextResponse.json([]);

  const tmdbRes = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${q}`
  );
  const tmdbData = await tmdbRes.json();

  let results = tmdbData.results || [];

  const { data: localResults } = await supabase
    .from('movies')
    .select('*')
    .ilike('title', `%${q}%`)
    .eq('category', category || 'all');

  const combined = [...results, ...(localResults || [])];

  return NextResponse.json(combined);
}
