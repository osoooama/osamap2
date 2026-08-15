export interface ChannelStream {
  id: string;
  name: string;
  streamType: string;
  streamIcon: string | null;
  streamUrl: string;
  sourceId?: number;
  categoryId?: string;
  added?: string;
}

export interface ChannelCategory {
  id: string;
  name: string;
  order: number;
  parentId?: string;
  streams: ChannelStream[];
}
