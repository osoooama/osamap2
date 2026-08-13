import axios from 'axios';
import Channel from '../models/Channel.model';

const IPTV_SOURCES = [
  {
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    name: 'iptv-org (all)',
  },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Sports': ['sport', 'football', 'soccer', 'basketball', 'tennis', 'golf', 'f1', 'nba', 'nfl', 'mlb', 'ufc', 'mma', 'boxing', 'bein', 'espn', 'sky sport', 'dazn', 'canal+ sport', 'match', 'ryze', 'supersport', ' premier league', ' la liga', ' bundesliga', ' serie a', ' ligue 1', ' champions league'],
  'Kids': ['kid', 'child', 'baby', 'cartoon', 'disney', 'nickelodeon', 'cartoon network', 'boomerang', 'junior', 'popeye', 'paw patrol', 'barbie', 'ben 10', 'tom and jerry'],
  'News': ['news', 'cnn', 'bbc', 'al jazeera', 'al Arabiya', 'sky news', 'france24', 'rt', 'fox news', 'msnbc', 'bloomberg', 'cnbc', '半岛', 'العربية', ' france info', ' euronews'],
  'Arabic': ['mbc', 'rotana', 'dubai', 'abu dhabi', 'al kahera', 'alarhbania', 'cairo', 'nile', 'zee alwan', 'osn', 'shahid', 'art', 'spacetoon', ' drama', ' سينما', ' منوعات', ' كوميدي'],
  'Turkish': ['turkish', 'turk', 'trt', 'show tv', 'kanal d', 'star tv', 'atv', 'fox tv', 'tv8', 'bein sport turk', 'ntv', 'haberturk'],
  'UFC': ['ufc', 'mma', 'bellator', 'boxing', 'fight', 'ppv'],
  'Music': ['mtv', 'vh1', 'fuse', 'music', 'fizz', ' trace', ' mcm'],
  'Documentary': ['discovery', 'nat geo', 'natgeo', 'history', 'animal planet', 'planet earth', 'national geographic'],
  'Entertainment': ['tnt', 'tbs', 'usa network', 'bravo', 'e entertainment', 'comedy central', 'syfy', 'fx', 'fxx'],
};

function parseM3U(content: string): Array<{ name: string; logo: string; group: string; url: string }> {
  const channels: Array<{ name: string; logo: string; group: string; url: string }> = [];
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);

      const name = nameMatch ? nameMatch[1].trim() : '';
      const logo = logoMatch ? logoMatch[1].trim() : '';
      const group = groupMatch ? groupMatch[1].trim() : '';

      i++;
      while (i < lines.length && (lines[i].startsWith('#') || lines[i] === '')) i++;

      if (i < lines.length && !lines[i].startsWith('#')) {
        const url = lines[i].trim();
        if (url.startsWith('http')) {
          channels.push({ name, logo, group, url });
        }
      }
    }
    i++;
  }
  return channels;
}

function categorize(name: string, group: string): string {
  const combined = `${name} ${group}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw.toLowerCase()))) {
      return category;
    }
  }

  if (group) return group;
  return 'General';
}

function channelExists(existing: Set<string>, url: string): boolean {
  return existing.has(url);
}

export async function refreshIptvChannels(): Promise<{ added: number; total: number; errors: string[] }> {
  let added = 0;
  let total = 0;
  const errors: string[] = [];

  const existingUrls = new Set<string>();
  try {
    const existing = await Channel.find({}).select('stream_url -_id').lean();
    existing.forEach(ch => existingUrls.add(ch.stream_url));
  } catch (err) {
    console.error('[IPTV] Failed to load existing channels:', err);
  }

  for (const source of IPTV_SOURCES) {
    try {
      console.log(`[IPTV] Fetching ${source.name}...`);
      const resp = await axios.get(source.url, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSAMADev/2.0)' },
      });

      const parsed = parseM3U(resp.data);
      total += parsed.length;
      console.log(`[IPTV] Parsed ${parsed.length} entries from ${source.name}`);

      const bulkOps: Array<{ updateOne: { filter: Record<string, unknown>; update: Record<string, unknown>; upsert: boolean } }> = [];

      for (const ch of parsed) {
        if (!ch.url || channelExists(existingUrls, ch.url)) continue;

        const category = categorize(ch.name, ch.group);
        const channelId = `iptv_${Buffer.from(ch.url).toString('base64').slice(0, 20).replace(/[+/=]/g, '')}`;

        bulkOps.push({
          updateOne: {
            filter: { channel_id: channelId },
            update: {
              $set: {
                channel_id: channelId,
                name: ch.name || 'Unknown Channel',
                stream_url: ch.url,
                category,
                logo_url: ch.logo || undefined,
                stream_type: 'live' as const,
                is_active: true,
                last_updated: new Date(),
              },
            },
            upsert: true,
          },
        });

        existingUrls.add(ch.url);
      }

      if (bulkOps.length > 0) {
        const result = await Channel.bulkWrite(bulkOps, { ordered: false }).catch(() => ({ upsertedCount: 0 }));
        added += result.upsertedCount || bulkOps.length;
        console.log(`[IPTV] Saved ${bulkOps.length} channels from ${source.name}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${source.name}: ${msg}`);
      console.error(`[IPTV] Error fetching ${source.name}:`, msg);
    }
  }

  console.log(`[IPTV] Done. Added: ${added}, Total parsed: ${total}, Errors: ${errors.length}`);
  return { added, total, errors };
}

export async function getChannelStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  lastUpdated: Date | null;
}> {
  const total = await Channel.countDocuments({ is_active: true });

  const categoryAgg = await Channel.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const typeAgg = await Channel.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$stream_type', count: { $sum: 1 } } },
  ]);

  const lastChannel = await Channel.findOne({}).sort({ last_updated: -1 }).select('last_updated -_id').lean();

  const byCategory: Record<string, number> = {};
  categoryAgg.forEach((a: { _id: string; count: number }) => { byCategory[a._id] = a.count; });

  const byType: Record<string, number> = {};
  typeAgg.forEach((a: { _id: string; count: number }) => { byType[a._id] = a.count; });

  return { total, byCategory, byType, lastUpdated: lastChannel?.last_updated || null };
}
