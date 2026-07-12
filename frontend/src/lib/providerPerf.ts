export interface ProviderEvent {
  success: boolean;
  loadMs: number;
  timestamp: number;
}

export interface ProviderPerf {
  events: ProviderEvent[];
  lastUsed: number;
}

export function loadProviderPerf(): Record<string, ProviderPerf> {
  try {
    const stored = localStorage.getItem('osk_provider_perf');
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

let perfCache: Record<string, ProviderPerf> | null = null;

export function getProviderPerf(): Record<string, ProviderPerf> {
  if (!perfCache) perfCache = loadProviderPerf();
  return perfCache;
}

export function getProviderScore(perf: ProviderPerf): number {
  const events = perf.events;
  if (events.length < 3) return 0;
  const successes = events.filter(e => e.success).length;
  const totalAttempts = events.length;
  const successRate = successes / totalAttempts;
  const avgLoadMs = events.filter(e => e.success && e.loadMs > 0).reduce((sum, e) => sum + e.loadMs, 0) / Math.max(1, successes);
  const now = Date.now();
  const hoursSinceLastUse = (now - perf.lastUsed) / (1000 * 60 * 60);
  const recencyBonus = hoursSinceLastUse < 24 ? 3 : hoursSinceLastUse < 168 ? 1 : 0;
  return successRate * 10 - (avgLoadMs || 3000) / 1000 + recencyBonus;
}

export function trackProviderEvent(name: string, success: boolean, loadMs: number = 0) {
  const perf = getProviderPerf();
  const now = Date.now();
  const p = perf[name] || { events: [], lastUsed: now };
  p.lastUsed = now;
  p.events.push({ success, loadMs, timestamp: now });
  if (p.events.length > 20) p.events = p.events.slice(-20);
  perf[name] = p;
  try { localStorage.setItem('osk_provider_perf', JSON.stringify(perf)); } catch {}
}

export function getBestProviderIndex(providers: { name: string }[]): number {
  if (providers.length === 0) return -1;
  const perf = getProviderPerf();
  const scored = providers.map((p, i) => {
    const per = perf[p.name];
    const score = per ? getProviderScore(per) : 0;
    return { index: i, score, name: p.name };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].index;
}
