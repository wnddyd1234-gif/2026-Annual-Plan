
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

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  color: 'red' | 'blue' | 'green' | 'purple' | 'amber';
}

export const TAGS: TagType[] = ['Launch', 'Sales', 'Plan', 'Focus', 'Work'];

export const TAG_COLORS: Record<TagType, string> = {
  'Launch': 'bg-rose-500 hover:bg-rose-600',
  'Sales': 'bg-sky-500 hover:bg-sky-600',
  'Plan': 'bg-emerald-500 hover:bg-emerald-600',
  'Focus': 'bg-indigo-500 hover:bg-indigo-600',
  'Work': 'bg-amber-500 hover:bg-amber-600',
};

export const CALENDAR_COLORS = {
  red: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200',
  blue: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
  purple: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
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
