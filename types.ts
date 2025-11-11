export interface ClickData {
  date: string;
  count: number;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  alias: string;
  createdAt: number;
  totalClicks: number;
  clickHistory: ClickData[];
  tags?: string[];
}

export type ViewMode = 'dashboard' | 'links' | 'create';

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  topPerformer: ShortLink | null;
}