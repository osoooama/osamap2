const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ChannelCategory {
  id: string;
  name: string;
  order: number;
  streams: ChannelStream[];
}

export interface ChannelStream {
  id: string;
  name: string;
  streamType: string;
  streamIcon: string | null;
  streamUrl: string;
  sourceId: number;
  categoryId: string;
}

interface BrowseCategory {
  category_id: string;
  name: string;
  type: string;
  is_hidden: number;
  channel_count: number;
}

interface BrowseChannel {
  item_id: string;
  name: string;
  stream_icon: string | null;
  stream_url: string | null;
  source_id: number;
  category_id: string;
  data: string | null;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

function buildStreamUrl(ch: BrowseChannel): string {
  if (ch.stream_url) return ch.stream_url;
  try {
    const data = JSON.parse(ch.data || '{}');
    if (data.stream_url) return data.stream_url;
  } catch {}
  return '';
}

export async function getCategoriesWithStreams(): Promise<ChannelCategory[]> {
  const categories = await apiFetch<BrowseCategory[]>("/api/browse/categories");
  const result: ChannelCategory[] = [];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    try {
      const channels = await apiFetch<BrowseChannel[]>(
        `/api/browse/category/${encodeURIComponent(cat.category_id)}`
      );
      result.push({
        id: cat.category_id,
        name: cat.name,
        order: i,
        streams: channels.map((ch) => ({
          id: ch.item_id,
          name: ch.name,
          streamType: "live",
          streamIcon: ch.stream_icon,
          streamUrl: buildStreamUrl(ch),
          sourceId: ch.source_id,
          categoryId: ch.category_id,
        })),
      });
    } catch {
      result.push({
        id: cat.category_id,
        name: cat.name,
        order: i,
        streams: [],
      });
    }
  }

  return result;
}

export async function searchChannels(q: string): Promise<ChannelStream[]> {
  const channels = await apiFetch<BrowseChannel[]>(
    `/api/browse/search?q=${encodeURIComponent(q)}`
  );
  return channels.map((ch) => ({
    id: ch.item_id,
    name: ch.name,
    streamType: "live",
    streamIcon: ch.stream_icon,
    streamUrl: buildStreamUrl(ch),
    sourceId: ch.source_id,
    categoryId: ch.category_id,
  }));
}
