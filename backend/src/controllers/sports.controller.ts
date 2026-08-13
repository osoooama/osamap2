import { Request, Response } from 'express';
import Match from '../models/Match.model';

const VALID_STATUSES = ['upcoming', 'live', 'finished'] as const;

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (date) filter.match_date = String(date);
    if (status && VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      filter.match_status = status;
    }

    const matches = await Match.find(filter).sort({ match_time: 1 }).limit(100);
    res.json({ matches, count: matches.length });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const match = await Match.findOne({ match_id: req.params.id });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    console.error('Error fetching match:', err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};
