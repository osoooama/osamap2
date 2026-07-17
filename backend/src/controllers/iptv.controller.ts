import { Request, Response } from 'express';
import Channel from '../models/Channel.model';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const { category, type, search } = req.query;
    const filter: any = { is_active: true };
    if (category) filter.category = category;
    if (type) filter.stream_type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const channels = await Channel.find(filter).sort({ name: 1 }).limit(200);
    res.json({ channels, count: channels.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

export const getChannelCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Channel.distinct('category', { is_active: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findOne({ channel_id: req.params.id });
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
};
