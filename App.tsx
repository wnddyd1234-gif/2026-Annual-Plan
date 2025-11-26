
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Loader2, Cloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TimelineItem, TimelineRow, TagType, CalendarEvent } from './types';
import TimelineBoard from './components/TimelineBoard';
import EventModal from './components/EventModal';
import MonthlyCalendarModal from './components/MonthlyCalendarModal';
import CalendarEventModal from './components/CalendarEventModal';
import { supabase } from './lib/supabase';

const generateId = () => Math.random().toString(36).substr(2, 9);

const PLAN_ID = 'main'; // Fixed ID for the shared plan

const App: React.FC = () => {
  // Global Data State
  const [slogan, setSlogan] = useState('');
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Sync Status State
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // --- Supabase Integration ---

  // 1. Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('annual_plans')
          .select('*')
          .eq('id', PLAN_ID)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
           throw error;
        }

        if (data) {
          setSlogan(data.slogan || '');
          setRows(data.rows || []);
          setItems(data.items || []);
          setCalendarEvents(data.calendar_events || []);
        } else {
          // Initialize default data if row doesn't exist
          setRows([{ id: generateId() }, { id: generateId() }, { id: generateId() }]);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setErrorMessage('데이터를 불러오는데 실패했습니다.');
        setSyncStatus('error');
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, []);

  // 2. Debounced Save
  // We use a ref to prevent saving on initial render and to handle debounce cleanup
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Skip the very first effect run after load if you strictly want to avoid saving what you just fetched.
    // However, usually it's fine.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSyncStatus('saving');
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        const payload = {
          id: PLAN_ID,
          slogan,
          rows,
          items,
          calendar_events: calendarEvents,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('annual_plans')
          .upsert(payload);

        if (error) throw error;
        setSyncStatus('saved');
        
        // Reset saved status to idle after a moment for visual feedback
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (err: any) {
        console.error('Error saving data:', err);
        setErrorMessage('저장 실패 (네트워크를 확인하세요)');
        setSyncStatus('error');
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [slogan, rows, items, calendarEvents, isLoaded]);


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
  
  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
  };

  const handleCalendarRangeSelect = (start: string, end: string) => {
    setPendingCalendarEvent({ startDate: start, endDate: end });
    setCalendarEventModalMode('create');
    setIsCalendarEventModalOpen(true);
  };

  const handleCalendarEventClick = (event: CalendarEvent) => {
    setPendingCalendarEvent(event);
    setCalendarEventModalMode('edit');
    setIsCalendarEventModalOpen(true);
  };

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

  const handleCalendarEventDelete = () => {
    if (pendingCalendarEvent.id) {
      setCalendarEvents(prev => prev.filter(e => e.id !== pendingCalendarEvent.id));
    }
    setIsCalendarEventModalOpen(false);
    setPendingCalendarEvent({});
  };

  // Loading Screen
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nuvu-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm text-gray-500 font-medium">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nuvu-bg text-nuvu-primary font-sans selection:bg-indigo-100 selection:text-indigo-800 flex flex-col relative">
      
      {/* Sync Status Indicator (Fixed Top Right) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-gray-100 rounded-full shadow-sm text-xs font-medium transition-all">
        {syncStatus === 'saving' && (
          <>
            <Cloud size={14} className="text-gray-400 animate-pulse" />
            <span className="text-gray-500">저장 중...</span>
          </>
        )}
        {syncStatus === 'saved' && (
          <>
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-green-600">저장됨</span>
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-red-600">{errorMessage || '오류 발생'}</span>
          </>
        )}
        {syncStatus === 'idle' && (
           <>
            <Cloud size={14} className="text-gray-300" />
            <span className="text-gray-400">동기화 완료</span>
           </>
        )}
      </div>

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
