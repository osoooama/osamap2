import { chromium, type Browser, type Page } from 'playwright-core';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser;
  const execPath = process.env.CHROMIUM_PATH || undefined;
  browser = await chromium.launch({
    headless: true,
    executablePath: execPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  return browser;
}

async function closeBrowser() {
  if (browser) {
    try { await browser.close(); } catch {}
    browser = null;
  }
}

process.on('SIGTERM', () => closeBrowser());
process.on('SIGINT', () => closeBrowser());

interface ScrapeResult {
  url: string;
  title?: string;
}

async function gotoPage(page: Page, url: string, timeout = 20000): Promise<string | null> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(2000);
    return await page.content();
  } catch {
    return null;
  }
}

export async function scrapeWithPlaywright(
  title: string,
  category: string,
): Promise<ScrapeResult | null> {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  try {
    if (category === 'arabic') {
      const result = await scrapeCinemana(page, title);
      if (result) return result;

      const result2 = await scrapeMyCima(page, title);
      if (result2) return result2;

      const result3 = await scrapeFaselHD(page, title);
      if (result3) return result3;
    } else if (category === 'turkish') {
      const result = await scrapeQissat(page, title);
      if (result) return result;
    }
  } finally {
    await context.close();
  }

  return null;
}

async function scrapeCinemana(page: Page, title: string): Promise<ScrapeResult | null> {
  const searchUrl = `https://cinemana.cc/?s=${encodeURIComponent(title)}`;
  const html = await gotoPage(page, searchUrl);
  if (!html || html.includes('Just a moment')) return null;

  const link = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/movie/"], a[href*="/tv/"]');
    return el ? (el as HTMLAnchorElement).href : null;
  });
  if (!link) return null;

  const contentHtml = await gotoPage(page, link);
  if (!contentHtml) return null;

  const streamUrl = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const text = s.textContent || '';
      const match = text.match(/(?:file|source|url)\s*[:=]\s*["']([^"']*\.m3u8[^"']*)/);
      if (match) return match[1];
    }
    const iframes = document.querySelectorAll('iframe[src]');
    for (const f of iframes) {
      const src = (f as HTMLIFrameElement).src;
      if (src && !src.includes('google') && !src.includes('ads')) return src;
    }
    return null;
  });

  if (streamUrl) {
    if (streamUrl.startsWith('http')) return { url: streamUrl, title };
    if (streamUrl.startsWith('//')) return { url: 'https:' + streamUrl, title };
  }

  return null;
}

async function scrapeMyCima(page: Page, title: string): Promise<ScrapeResult | null> {
  const searchUrl = `https://mycima.video/search/${encodeURIComponent(title)}`;
  const html = await gotoPage(page, searchUrl);
  if (!html) return null;

  const link = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/watch/"]');
    return el ? (el as HTMLAnchorElement).href : null;
  });
  if (!link) return null;

  const contentHtml = await gotoPage(page, link);
  if (!contentHtml) return null;

  const streamUrl = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const text = s.textContent || '';
      const match = text.match(/(?:file|source|url)\s*[:=]\s*["']([^"']*\.m3u8[^"']*)/);
      if (match) return match[1];
    }
    return null;
  });

  if (streamUrl) {
    if (streamUrl.startsWith('http')) return { url: streamUrl, title };
    if (streamUrl.startsWith('//')) return { url: 'https:' + streamUrl, title };
  }

  return null;
}

async function scrapeFaselHD(page: Page, title: string): Promise<ScrapeResult | null> {
  const domains = ['https://www.faselhd.club', 'https://www.faselhds.com'];
  for (const base of domains) {
    const searchUrl = `${base}/?s=${encodeURIComponent(title)}`;
    const html = await gotoPage(page, searchUrl);
    if (!html || html.includes('Just a moment')) continue;

    const link = await page.evaluate(() => {
      const el = document.querySelector('a.post-photo');
      return el ? (el as HTMLAnchorElement).href : null;
    });
    if (!link) continue;

    const contentHtml = await gotoPage(page, link);
    if (!contentHtml) continue;

    const streamUrl = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const text = s.textContent || '';
        const match = text.match(/(?:file|source|url)\s*[:=]\s*["']([^"']*\.m3u8[^"']*)/);
        if (match) return match[1];
      }
      return null;
    });

    if (streamUrl) {
      if (streamUrl.startsWith('http')) return { url: streamUrl, title };
      if (streamUrl.startsWith('//')) return { url: 'https:' + streamUrl, title };
    }
  }
  return null;
}

async function scrapeQissat(page: Page, title: string): Promise<ScrapeResult | null> {
  const searchUrl = `https://ar.qissat.tv/?s=${encodeURIComponent(title)}`;
  const html = await gotoPage(page, searchUrl);
  if (!html) return null;

  const link = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/watch/"]');
    return el ? (el as HTMLAnchorElement).href : null;
  });
  if (!link) return null;

  const contentHtml = await gotoPage(page, link);
  if (!contentHtml) return null;

  const streamUrl = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const text = s.textContent || '';
      const match = text.match(/(?:file|source|url)\s*[:=]\s*["']([^"']*\.m3u8[^"']*)/);
      if (match) return match[1];
    }
    return null;
  });

  if (streamUrl) {
    if (streamUrl.startsWith('http')) return { url: streamUrl, title };
    if (streamUrl.startsWith('//')) return { url: 'https:' + streamUrl, title };
  }

  return null;
}
