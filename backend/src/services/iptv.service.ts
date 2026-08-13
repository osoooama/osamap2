import axios from 'axios';
import Channel from '../models/Channel.model';

const IPTV_SOURCES = [
  {
    url: 'https://iptv-org.github.io/iptv/languages/ara.m3u',
    name: 'iptv-org-arabic',
    label: 'القنوات العربية',
  },
  {
    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    name: 'iptv-org-sports',
    label: 'قنوات الرياضة',
  },
  {
    url: 'https://iptv-org.github.io/iptv/countries/sa.m3u',
    name: 'iptv-org-saudi',
    label: 'قنوات السعودية',
  },
  {
    url: 'https://iptv-org.github.io/iptv/regions/arab.m3u',
    name: 'iptv-org-arab-region',
    label: 'المنطقة العربية',
  },
  {
    url: 'https://raw.githubusercontent.com/BONDdata/m3u8/refs/heads/main/1.Starzplay.m3u8',
    name: 'starzplay',
    label: 'Starzplay',
  },
];

const EPG_SOURCES = [
  'https://epg.112114.xyz/channels.json',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Sports': [
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'golf', 'f1', 'nba', 'nfl',
    'mlb', 'ufc', 'mma', 'boxing', 'bein', 'espn', 'sky sport', 'dazn', 'canal+ sport',
    'match', 'ryze', 'supersport', 'premier league', 'la liga', 'bundesliga', 'serie a',
    'ligue 1', 'champions league', 'ssc', 'alkass', 'bein sport', 'abu dhabi sport',
  ],
  'Kids': [
    'kid', 'child', 'baby', 'cartoon', 'disney', 'nickelodeon', 'cartoon network',
    'boomerang', 'junior', 'popeye', 'paw patrol', 'barbie', 'ben 10', 'tom and jerry',
    'spacetoon', 'mbc 3', 'cn arabi', 'arabic cartoon', 'aaj kids', 'kids zone',
  ],
  'News': [
    'news', 'cnn', 'bbc', 'al jazeera', 'al arabiya', 'sky news', 'france24', 'rt',
    'fox news', 'msnbc', 'bloomberg', 'cnbc', '半岛', 'العربية', 'france info',
    'euronews', 'alhadath', 'alkahera news', 'dubai one', 'abu dhabi news',
  ],
  'Arabic': [
    'mbc', 'rotana', 'dubai', 'abu dhabi', 'al kahera', 'cairo', 'nile', 'zee alwan',
    'osn', 'shahid', 'art', 'drama', 'سينما', 'منوعات', 'كوميدي', 'mazzika',
    'rotana cinema', 'rotana drama', 'mbc 1', 'mbc 2', 'mbc 4', 'mbc action',
    'mbc max', 'mbc drama', 'mbc variety', 'mbc+ variety', 'mbc+ drama',
  ],
  'Turkish': [
    'turkish', 'turk', 'trt', 'show tv', 'kanal d', 'star tv', 'atv', 'fox tv',
    'tv8', 'bein sport turk', 'ntv', 'haberturk', 'dizi', 'turk tv',
  ],
  'UFC': ['ufc', 'mma', 'bellator', 'boxing', 'fight', 'ppv'],
  'Music': ['mtv', 'vh1', 'fuse', 'music', 'fizz', 'trace', 'mcm', 'mazzika', 'nile music'],
  'Documentary': [
    'discovery', 'nat geo', 'natgeo', 'history', 'animal planet', 'planet earth',
    'national geographic', 'documentary', 'science',
  ],
  'Entertainment': [
    'tnt', 'tbs', 'usa network', 'bravo', 'e entertainment', 'comedy central',
    'syfy', 'fx', 'fxx', 'entertainment', 'talk show', 'reality',
  ],
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

function generateChannelId(url: string, source: string): string {
  const hash = Buffer.from(url).toString('base64').slice(0, 20).replace(/[+/=]/g, '');
  return `${source}_${hash}`;
}

async function checkUrlAlive(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    await axios.head(url, {
      timeout: timeoutMs,
      maxRedirects: 3,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSAMADev/2.0)' },
    });
    return true;
  } catch {
    try {
      const resp = await axios.get(url, {
        timeout: timeoutMs,
        maxRedirects: 3,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSAMADev/2.0)' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      return resp.status === 200;
    } catch {
      return false;
    }
  }
}

async function checkUrlsBatch(
  urls: string[],
  concurrency = 10,
  timeoutMs = 5000
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const checks = batch.map(async (url) => {
      const alive = await checkUrlAlive(url, timeoutMs);
      results.set(url, alive);
    });
    await Promise.allSettled(checks);
  }

  return results;
}

export async function refreshIptvChannels(): Promise<{
  added: number;
  updated: number;
  removed: number;
  totalParsed: number;
  aliveCount: number;
  deadCount: number;
  errors: string[];
}> {
  let added = 0;
  let updated = 0;
  let totalParsed = 0;
  const errors: string[] = [];

  const existingChannels = await Channel.find({}).select('stream_url channel_id is_alive check_count last_checked -_id').lean();
  const existingByUrl = new Map<string, { stream_url: string; channel_id: string; is_alive: boolean; check_count: number; last_checked: Date }>();
  existingChannels.forEach((ch: { stream_url: string; channel_id: string; is_alive: boolean; check_count: number; last_checked: Date }) => existingByUrl.set(ch.stream_url, ch));

  const allNewUrls: Array<{ name: string; logo: string; group: string; url: string; source: string }> = [];

  for (const source of IPTV_SOURCES) {
    try {
      console.log(`[IPTV] Fetching ${source.label} (${source.name})...`);
      const resp = await axios.get(source.url, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSAMADev/2.0)' },
      });

      const parsed = parseM3U(resp.data);
      totalParsed += parsed.length;
      console.log(`[IPTV] Parsed ${parsed.length} entries from ${source.name}`);

      for (const ch of parsed) {
        allNewUrls.push({ ...ch, source: source.name });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${source.name}: ${msg}`);
      console.error(`[IPTV] Error fetching ${source.name}:`, msg);
    }
  }

  const bulkOps: Array<{
    updateOne: {
      filter: Record<string, unknown>;
      update: Record<string, unknown>;
      upsert: boolean;
    };
  }> = [];

  const newUrlSet = new Set(allNewUrls.map(c => c.url));

  for (const ch of allNewUrls) {
    if (!ch.url) continue;

    const existing = existingByUrl.get(ch.url);
    const category = categorize(ch.name, ch.group);
    const channelId = generateChannelId(ch.url, ch.source);

    if (existing) {
      if (existing.channel_id !== channelId || existing.is_alive === false) {
        bulkOps.push({
          updateOne: {
            filter: { stream_url: ch.url },
            update: {
              $set: {
                channel_id: channelId,
                name: ch.name || 'Unknown Channel',
                category,
                logo_url: ch.logo || undefined,
                source: ch.source,
                is_active: true,
                is_alive: true,
                last_checked: new Date(),
                last_updated: new Date(),
              },
            },
            upsert: false,
          },
        });
        updated++;
      }
    } else {
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
              source: ch.source,
              last_checked: new Date(),
              is_alive: true,
              check_count: 0,
              last_updated: new Date(),
            },
          },
          upsert: true,
        },
      });
      added++;
    }
  }

  if (bulkOps.length > 0) {
    try {
      await Channel.bulkWrite(bulkOps, { ordered: false });
      console.log(`[IPTV] Bulk write: ${added} added, ${updated} updated`);
    } catch (err) {
      console.error('[IPTV] Bulk write error:', err);
      errors.push(`Bulk write failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`[IPTV] Refresh complete. Added: ${added}, Updated: ${updated}, Total parsed: ${totalParsed}`);
  return { added, updated, removed: 0, totalParsed, aliveCount: 0, deadCount: 0, errors };
}

export async function cleanupDeadChannels(): Promise<{
  checked: number;
  alive: number;
  removed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let checked = 0;
  let alive = 0;
  let removed = 0;

  const channels = await Channel.find({ is_active: true })
    .select('channel_id stream_url name last_checked check_count -_id')
    .lean();

  console.log(`[IPTV Cleanup] Checking ${channels.length} channels...`);

  const urls = channels.map((ch: { stream_url: string }) => ch.stream_url);
  const results = await checkUrlsBatch(urls, 10, 5000);

  const bulkOps: Array<{
    updateOne: {
      filter: Record<string, unknown>;
      update: Record<string, unknown>;
    };
  }> = [];

  const deleteOps: Array<{
    deleteOne: {
      filter: Record<string, unknown>;
    };
  }> = [];

  for (const ch of channels) {
    checked++;
    const isAlive = results.get(ch.stream_url) ?? false;

    if (isAlive) {
      alive++;
      bulkOps.push({
        updateOne: {
          filter: { channel_id: ch.channel_id },
          update: {
            $set: {
              is_alive: true,
              check_count: (ch.check_count || 0) + 1,
              last_checked: new Date(),
            },
          },
        },
      });
    } else {
      const newCheckCount = (ch.check_count || 0) + 1;
      if (newCheckCount >= 3) {
        deleteOps.push({
          deleteOne: {
            filter: { channel_id: ch.channel_id },
          },
        });
        removed++;
        console.log(`[IPTV Cleanup] Removing dead channel: ${ch.name} (${ch.channel_id})`);
      } else {
        bulkOps.push({
          updateOne: {
            filter: { channel_id: ch.channel_id },
            update: {
              $set: {
                is_alive: false,
                check_count: newCheckCount,
                last_checked: new Date(),
              },
            },
          },
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    try {
      await Channel.bulkWrite(bulkOps, { ordered: false });
    } catch (err) {
      errors.push(`Bulk update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (deleteOps.length > 0) {
    try {
      await Channel.bulkWrite(deleteOps, { ordered: false });
    } catch (err) {
      errors.push(`Bulk delete failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`[IPTV Cleanup] Done. Checked: ${checked}, Alive: ${alive}, Removed: ${removed}`);
  return { checked, alive, removed, errors };
}

export async function getChannelStats(): Promise<{
  total: number;
  alive: number;
  dead: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  byType: Record<string, number>;
  lastUpdated: Date | null;
}> {
  const total = await Channel.countDocuments({ is_active: true });
  const alive = await Channel.countDocuments({ is_active: true, is_alive: true });
  const dead = total - alive;

  const categoryAgg = await Channel.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sourceAgg = await Channel.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const typeAgg = await Channel.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$stream_type', count: { $sum: 1 } } },
  ]);

  const lastChannel = await Channel.findOne({}).sort({ last_updated: -1 }).select('last_updated -_id').lean();

  const byCategory: Record<string, number> = {};
  categoryAgg.forEach((a: { _id: string; count: number }) => { byCategory[a._id] = a.count; });

  const bySource: Record<string, number> = {};
  sourceAgg.forEach((a: { _id: string; count: number }) => { bySource[a._id] = a.count; });

  const byType: Record<string, number> = {};
  typeAgg.forEach((a: { _id: string; count: number }) => { byType[a._id] = a.count; });

  return { total, alive, dead, byCategory, bySource, byType, lastUpdated: lastChannel?.last_updated || null };
}

export interface EPGProgram {
  channel: string;
  title: string;
  start: string;
  end: string;
  description?: string;
}

export async function getEPG(channelId?: string): Promise<EPGProgram[]> {
  try {
    const { data } = await axios.get(EPG_SOURCES[0], {
      timeout: 15000,
      headers: { 'User-Agent': 'OSAMADev/2.0' },
    });

    if (!data) return [];

    let channels: Array<Record<string, unknown>> = [];

    if (Array.isArray(data)) {
      channels = data;
    } else if (data.channels && Array.isArray(data.channels)) {
      channels = data.channels;
    }

    const programs: EPGProgram[] = [];

    for (const ch of channels.slice(0, 50)) {
      const chName = String(ch.name || ch.id || '');
      const chPrograms = ch.programs || ch.epg || [];

      if (channelId) {
        const channel = await Channel.findOne({ channel_id: channelId }).lean();
        if (channel && !chName.toLowerCase().includes(channel.name.toLowerCase().slice(0, 10))) {
          continue;
        }
      }

      if (Array.isArray(chPrograms)) {
        for (const p of chPrograms.slice(0, 5)) {
          programs.push({
            channel: chName,
            title: String((p as Record<string, unknown>).title || ''),
            start: String((p as Record<string, unknown>).start || ''),
            end: String((p as Record<string, unknown>).end || ''),
            description: (p as Record<string, unknown>).description ? String((p as Record<string, unknown>).description) : undefined,
          });
        }
      }
    }

    return programs.slice(0, 100);
  } catch (err) {
    console.error('[IPTV] EPG fetch error:', err);
    return [];
  }
}
