import { Request, Response } from 'express';
import Channel from '../models/Channel.model';
import { refreshIptvChannels, cleanupDeadChannels, getChannelStats, getEPG } from '../services/iptv.service';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getChannels = async (req: Request, res: Response) => {
  try {
    const { category, type, search, source, alive } = req.query;
    const filter: Record<string, unknown> = { is_active: true };
    if (category) filter.category = String(category);
    if (type) filter.stream_type = String(type);
    if (source) filter.source = String(source);
    if (alive !== undefined) filter.is_alive = alive === 'true';
    if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };

    const channels = await Channel.find(filter).sort({ name: 1 }).limit(500);
    res.json({ channels, count: channels.length });
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

export const getChannelCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Channel.distinct('category', { is_active: true });
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findOne({ channel_id: req.params.id });
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  } catch (err) {
    console.error('Error fetching channel:', err);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
};

export const refreshChannels = async (_req: Request, res: Response) => {
  try {
    console.log('[IPTV] Manual refresh triggered');
    const result = await refreshIptvChannels();
    res.json({
      message: 'Refresh complete',
      added: result.added,
      updated: result.updated,
      totalParsed: result.totalParsed,
      errors: result.errors,
    });
  } catch (err) {
    console.error('Error refreshing channels:', err);
    res.status(500).json({ error: 'Failed to refresh channels' });
  }
};

export const cleanupChannels = async (_req: Request, res: Response) => {
  try {
    console.log('[IPTV] Manual cleanup triggered');
    const result = await cleanupDeadChannels();
    res.json({
      message: 'Cleanup complete',
      checked: result.checked,
      alive: result.alive,
      removed: result.removed,
      errors: result.errors,
    });
  } catch (err) {
    console.error('Error cleaning up channels:', err);
    res.status(500).json({ error: 'Failed to cleanup channels' });
  }
};

export const getChannelStatsController = async (_req: Request, res: Response) => {
  try {
    const stats = await getChannelStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getChannelHealth = async (_req: Request, res: Response) => {
  try {
    const total = await Channel.countDocuments({ is_active: true });
    const alive = await Channel.countDocuments({ is_active: true, is_alive: true });
    const dead = total - alive;
    const lastChecked = await Channel.findOne({}).sort({ last_checked: -1 }).select('last_checked -_id').lean();

    res.json({
      total,
      alive,
      dead,
      healthPercent: total > 0 ? Math.round((alive / total) * 100) : 0,
      lastChecked: lastChecked?.last_checked || null,
    });
  } catch (err) {
    console.error('Error fetching health:', err);
    res.status(500).json({ error: 'Failed to fetch health' });
  }
};

export const getEPGController = async (req: Request, res: Response) => {
  try {
    const channelId = req.query.channel as string;
    const programs = await getEPG(channelId);
    res.json({ programs, count: programs.length });
  } catch (err) {
    console.error('Error fetching EPG:', err);
    res.status(500).json({ error: 'Failed to fetch EPG' });
  }
};
