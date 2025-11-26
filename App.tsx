
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { TimelineItem, TimelineRow, TagType, DailyEvent } from './types';
import TimelineBoard from './components/TimelineBoard';
import EventModal from './components/EventModal';
import MonthlyCalendarModal from './components/MonthlyCalendarModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_KEY = 'nuvu-plan-2026-v3'; // Bump version for new schema

const App: React.FC = () => {
  // State
  const [slogan, setSlogan] = useState('');
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [dailyEvents, setDailyEvents] = useState<DailyEvent[]>([]);

  // Modal State (Timeline)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [pendingEvent, setPendingEvent] = useState<Partial<TimelineItem>>({});

  // Modal State (Monthly Calendar)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRows(parsed.rows || []);
        setItems(parsed.items || []);
        setSlogan(parsed.slogan || '');
        setDailyEvents(parsed.dailyEvents || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    } else {
      // Initial State
      setRows([{ id: generateId() }, { id: generateId() }, { id: generateId() }]);
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slogan, rows, items, dailyEvents }));
  }, [slogan, rows, items, dailyEvents]);

  // Handlers - Timeline
  const handleAddRow = () => {
    setRows(prev => [...prev, { id: generateId() }]);
  };

  const handleRangeSelected = useCallback((rowId: string, start: number, end: number) => {
    setPendingEvent({
      rowId,
      startMonth: start,
      endMonth: end,
      title: '',
      tag: 'Launch'
    });
    setModalMode('create');
    setIsModalOpen(true);
  }, []);

  const handleItemClick = useCallback((item: TimelineItem) => {
    setPendingEvent(item);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleModalSave = (data: { title: string; tag: TagType }) => {
    if (modalMode === 'create') {
      const newItem: TimelineItem = {
        id: generateId(),
        rowId: pendingEvent.rowId!,
        startMonth: pendingEvent.startMonth!,
        endMonth: pendingEvent.endMonth!,
        title: data.title,
        tag: data.tag
      };
      setItems(prev => [...prev, newItem]);
    } else {
      // Edit
      setItems(prev => prev.map(item => 
        item.id === pendingEvent.id 
          ? { ...item, title: data.title, tag: data.tag } 
          : item
      ));
    }
    setIsModalOpen(false);
    setPendingEvent({});
  };

  const handleModalDelete = () => {
    if (pendingEvent.id) {
      setItems(prev => prev.filter(i => i.id !== pendingEvent.id));
    }
    setIsModalOpen(false);
    setPendingEvent({});
  };

  // Handlers - Monthly Calendar
  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
  };

  const handleAddDailyEvent = (date: string, content: string) => {
    setDailyEvents(prev => [...prev, {
      id: generateId(),
      date,
      content
    }]);
  };

  const handleDeleteDailyEvent = (id: string) => {
    setDailyEvents(prev => prev.filter(e => e.id !== id));
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
            onRangeSelected={handleRangeSelected}
            onItemClick={handleItemClick}
            onMonthClick={handleMonthClick}
          />
          
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">
               Tip: 빈 칸을 드래그하여 타임라인 일정을 생성하고, 월(Month) 이름을 클릭하여 상세 날짜별 일정을 관리하세요.
             </p>
          </div>
        </main>
        
        <footer className="mt-12 text-center text-gray-300 text-xs py-4">
          &copy; 2026 NUVUNUVU Corp.
        </footer>

      </div>

      {/* Timeline Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={pendingEvent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={modalMode === 'edit' ? handleModalDelete : undefined}
      />

      {/* Monthly Calendar Modal */}
      <MonthlyCalendarModal 
        isOpen={!!selectedMonth}
        month={selectedMonth}
        year={2026}
        events={dailyEvents}
        onClose={() => setSelectedMonth(null)}
        onAddEvent={handleAddDailyEvent}
        onDeleteEvent={handleDeleteDailyEvent}
      />
    </div>
  );
};

export default App;
