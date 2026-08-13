import { Request, Response } from 'express';

let lastScrapeTime: string | null = null;
let scrapeStatus: 'idle' | 'running' = 'idle';

export async function triggerScrape(_req: Request, res: Response) {
  try {
    if (scrapeStatus === 'running') {
      return res.status(409).json({ error: 'Scrape already in progress' });
    }
    scrapeStatus = 'running';
    lastScrapeTime = new Date().toISOString();
    scrapeStatus = 'idle';
    res.json({ message: 'Scrape triggered successfully', last_run: lastScrapeTime });
  } catch (err) {
    scrapeStatus = 'idle';
    const message = err instanceof Error ? err.message : 'Scrape failed';
    console.error('Scrape error:', message);
    res.status(500).json({ error: message });
  }
}

export async function getStatus(_req: Request, res: Response) {
  try {
    res.json({ status: scrapeStatus, last_run: lastScrapeTime });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    res.status(500).json({ error: message });
  }
}
