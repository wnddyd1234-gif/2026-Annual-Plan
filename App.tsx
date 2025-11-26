
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { TimelineItem, TimelineRow, TagType, CalendarEvent } from './types';
import TimelineBoard from './components/TimelineBoard';
import EventModal from './components/EventModal';
import MonthlyCalendarModal from './components/MonthlyCalendarModal';
import CalendarEventModal from './components/CalendarEventModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_KEY = 'nuvu-plan-2026-v5'; // Bump version for schema change

const App: React.FC = () => {
  // Global State
  const [slogan, setSlogan] = useState('');
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Timeline Modal State
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [timelineModalMode, setTimelineModalMode] = useState<'create' | 'edit'>('create');
  const [pendingTimelineItem, setPendingTimelineItem] = useState<Partial<TimelineItem>>({});

  // Monthly Calendar Modal State (The Grid View)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Calendar Event Modal State (Detailed Editor)
  const [isCalendarEventModalOpen, setIsCalendarEventModalOpen] = useState(false);
  const [calendarEventModalMode, setCalendarEventModalMode] = useState<'create' | 'edit'>('create');
  const [pendingCalendarEvent, setPendingCalendarEvent] = useState<Partial<CalendarEvent>>({});

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRows(parsed.rows || []);
        setItems(parsed.items || []);
        setSlogan(parsed.slogan || '');
        setCalendarEvents(parsed.calendarEvents || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    } else {
      setRows([{ id: generateId() }, { id: generateId() }, { id: generateId() }]);
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slogan, rows, items, calendarEvents }));
  }, [slogan, rows, items, calendarEvents]);

  // --- Timeline Handlers ---
  const handleAddRow = () => setRows(prev => [...prev, { id: generateId() }]);

  const handleTimelineRangeSelected = useCallback((rowId: string, start: number, end: number) => {
    setPendingTimelineItem({ rowId, startMonth: start, endMonth: end, title: '', tag: 'Launch' });
    setTimelineModalMode('create');
    setIsTimelineModalOpen(true);
  }, []);

  const handleTimelineItemClick = useCallback((item: TimelineItem) => {
    setPendingTimelineItem(item);
    setTimelineModalMode('edit');
    setIsTimelineModalOpen(true);
  }, []);

  const handleTimelineSave = (data: { title: string; tag: TagType }) => {
    if (timelineModalMode === 'create') {
      const newItem: TimelineItem = {
        id: generateId(),
        rowId: pendingTimelineItem.rowId!,
        startMonth: pendingTimelineItem.startMonth!,
        endMonth: pendingTimelineItem.endMonth!,
        title: data.title,
        tag: data.tag
      };
      setItems(prev => [...prev, newItem]);
    } else {
      setItems(prev => prev.map(item => 
        item.id === pendingTimelineItem.id 
          ? { ...item, title: data.title, tag: data.tag } 
          : item
      ));
    }
    setIsTimelineModalOpen(false);
    setPendingTimelineItem({});
  };

  const handleTimelineDelete = () => {
    if (pendingTimelineItem.id) {
      setItems(prev => prev.filter(i => i.id !== pendingTimelineItem.id));
    }
    setIsTimelineModalOpen(false);
    setPendingTimelineItem({});
  };

  // --- Monthly Calendar Handlers ---
  
  // Open the month view
  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
  };

  // User dragged a range in the monthly calendar -> Open Create Modal
  const handleCalendarRangeSelect = (start: string, end: string) => {
    setPendingCalendarEvent({ startDate: start, endDate: end });
    setCalendarEventModalMode('create');
    setIsCalendarEventModalOpen(true);
  };

  // User clicked an existing event -> Open Edit Modal
  const handleCalendarEventClick = (event: CalendarEvent) => {
    setPendingCalendarEvent(event);
    setCalendarEventModalMode('edit');
    setIsCalendarEventModalOpen(true);
  };

  // Save from CalendarEventModal
  const handleCalendarEventSave = (data: Omit<CalendarEvent, 'id'>) => {
    if (calendarEventModalMode === 'create') {
      const newEvent: CalendarEvent = {
        id: generateId(),
        ...data
      };
      setCalendarEvents(prev => [...prev, newEvent]);
    } else {
      setCalendarEvents(prev => prev.map(e => 
        e.id === pendingCalendarEvent.id ? { ...e, ...data } : e
      ));
    }
    setIsCalendarEventModalOpen(false);
    setPendingCalendarEvent({});
  };

  // Delete from CalendarEventModal
  const handleCalendarEventDelete = () => {
    if (pendingCalendarEvent.id) {
      setCalendarEvents(prev => prev.filter(e => e.id !== pendingCalendarEvent.id));
    }
    setIsCalendarEventModalOpen(false);
    setPendingCalendarEvent({});
  };

  return (
    <div className="min-h-screen bg-nuvu-bg text-nuvu-primary font-sans selection:bg-indigo-100 selection:text-indigo-800 flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
             <Sparkles size={14} className="text-amber-400 fill-amber-400" />
             <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Strategic Planning Dashboard</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-4">
            NUVUNUVU <span className="text-indigo-500">2026</span> Annual Plan
          </h1>
          <div className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="2026년 전체 슬로건을 입력해주세요"
              className="w-full text-center text-xl text-gray-700 bg-transparent border-b-2 border-gray-200 focus:border-indigo-400 py-2 outline-none transition-all placeholder-gray-300 font-light"
            />
          </div>
        </header>

        {/* Main Board */}
        <main className="flex-1 flex flex-col">
          <TimelineBoard
            rows={rows}
            items={items}
            onAddRow={handleAddRow}
            onRangeSelected={handleTimelineRangeSelected}
            onItemClick={handleTimelineItemClick}
            onMonthClick={handleMonthClick}
          />
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">
               Tip: 빈 칸을 드래그하여 타임라인 일정을 생성하고, 월(Month) 이름을 클릭하여 상세 캘린더를 확인하세요.
             </p>
          </div>
        </main>
        
        <footer className="mt-12 text-center text-gray-300 text-xs py-4">
          &copy; 2026 NUVUNUVU Corp.
        </footer>
      </div>

      {/* 1. Timeline Item Modal (Annual View) */}
      <EventModal
        isOpen={isTimelineModalOpen}
        mode={timelineModalMode}
        initialData={pendingTimelineItem}
        onClose={() => setIsTimelineModalOpen(false)}
        onSave={handleTimelineSave}
        onDelete={timelineModalMode === 'edit' ? handleTimelineDelete : undefined}
      />

      {/* 2. Monthly Calendar Grid View */}
      <MonthlyCalendarModal 
        isOpen={!!selectedMonth}
        month={selectedMonth}
        year={2026}
        events={calendarEvents}
        onClose={() => setSelectedMonth(null)}
        onRangeSelect={handleCalendarRangeSelect}
        onEventClick={handleCalendarEventClick}
      />

      {/* 3. Calendar Event Modal (Detailed Edit) */}
      <CalendarEventModal
        isOpen={isCalendarEventModalOpen}
        mode={calendarEventModalMode}
        initialData={pendingCalendarEvent}
        onClose={() => setIsCalendarEventModalOpen(false)}
        onSave={handleCalendarEventSave}
        onDelete={calendarEventModalMode === 'edit' ? handleCalendarEventDelete : undefined}
      />
    </div>
  );
};

export default App;
