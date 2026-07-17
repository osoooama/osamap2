import { Request, Response } from 'express';
import Match from '../models/Match.model';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const filter: any = {};
    if (date) filter.match_date = date;
    if (status) filter.match_status = status;

    const matches = await Match.find(filter).sort({ match_time: 1 }).limit(100);
    res.json({ matches, count: matches.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const match = await Match.findOne({ match_id: req.params.id });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};
