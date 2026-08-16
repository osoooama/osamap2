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
  const channels = await apiFetch<BrowseChannel[]>("/api/browse/all");

  const mergedMap = new Map<string, ChannelCategory>();

  for (const ch of channels) {
    const key = ch.category_id;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        id: key,
        name: key,
        order: mergedMap.size,
        streams: [],
      });
    }
    mergedMap.get(key)!.streams.push({
      id: ch.item_id,
      name: ch.name,
      streamType: "live",
      streamIcon: ch.stream_icon,
      streamUrl: buildStreamUrl(ch),
      sourceId: ch.source_id,
      categoryId: ch.category_id,
    });
  }

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => a.name.localeCompare(b.name));
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
