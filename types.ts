
export type TagType = 'Launch' | 'Sales' | 'Plan' | 'Focus' | 'Work';

export interface TimelineItem {
  id: string;
  rowId: string;
  title: string;
  tag: TagType;
  startMonth: number; // 1-12
  endMonth: number;   // 1-12
}

export interface TimelineRow {
  id: string;
}

export interface DailyEvent {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  isHoliday?: boolean;
}

export const TAGS: TagType[] = ['Launch', 'Sales', 'Plan', 'Focus', 'Work'];

export const TAG_COLORS: Record<TagType, string> = {
  'Launch': 'bg-rose-500 hover:bg-rose-600',
  'Sales': 'bg-sky-500 hover:bg-sky-600',
  'Plan': 'bg-emerald-500 hover:bg-emerald-600',
  'Focus': 'bg-indigo-500 hover:bg-indigo-600',
  'Work': 'bg-amber-500 hover:bg-amber-600',
};

// Legacy types (kept for compatibility if needed, though mostly unused in new refactor)
export interface PlanItem {
  id: string;
  content: string;
  tag: string;
}

export interface QuarterData {
  id: string;
  name: string;
  theme: string;
  productStrategy: PlanItem[];
  designProduction: PlanItem[];
}

export const PRODUCT_TAGS = TAGS;
export const DESIGN_TAGS = TAGS;
