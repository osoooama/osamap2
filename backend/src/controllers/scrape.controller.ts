import { Request, Response } from 'express';

export async function triggerScrape(_req: Request, res: Response) {
  try {
    res.json({ message: 'Scrape triggered successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    res.status(500).json({ error: message });
  }
}

export async function getStatus(_req: Request, res: Response) {
  try {
    res.json({ status: 'idle', last_run: null, next_run: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    res.status(500).json({ error: message });
  }
}
