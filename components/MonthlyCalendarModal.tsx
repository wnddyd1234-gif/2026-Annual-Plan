
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { DailyEvent } from '../types';

interface MonthlyCalendarModalProps {
  isOpen: boolean;
  month: number | null; // 1-12
  year: number;
  events: DailyEvent[];
  onClose: () => void;
  onAddEvent: (date: string, content: string) => void;
  onDeleteEvent: (id: string) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MonthlyCalendarModal: React.FC<MonthlyCalendarModalProps> = ({
  isOpen,
  month,
  year,
  events,
  onClose,
  onAddEvent,
  onDeleteEvent
}) => {
  // Selection State: Start and End Day numbers
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  
  // Dragging State
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);

  const [newEventContent, setNewEventContent] = useState('');

  // Handle Global Mouse Up to end drag
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStart !== null && dragCurrent !== null) {
        setSelection({
          start: Math.min(dragStart, dragCurrent),
          end: Math.max(dragStart, dragCurrent)
        });
        setDragStart(null);
        setDragCurrent(null);
        setNewEventContent('');
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragStart, dragCurrent]);

  if (!isOpen || month === null) return null;

  // Helpers for Calendar Logic
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7;

  // Format YYYY-MM-DD
  const formatDate = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Drag Handlers
  const handleDayMouseDown = (day: number) => {
    setDragStart(day);
    setDragCurrent(day);
    setSelection(null); // Clear previous selection on new drag
  };

  const handleDayMouseEnter = (day: number) => {
    if (dragStart !== null) {
      setDragCurrent(day);
    }
  };

  // Add Event Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selection && newEventContent.trim()) {
      // Create event for each day in range
      for (let d = selection.start; d <= selection.end; d++) {
        onAddEvent(formatDate(d), newEventContent.trim());
      }
      setNewEventContent('');
    }
  };

  const currentMonthEvents = events.filter(e => {
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m === month;
  });

  // Derived state for rendering
  const isSelected = (day: number) => {
    if (dragStart !== null && dragCurrent !== null) {
      const min = Math.min(dragStart, dragCurrent);
      const max = Math.max(dragStart, dragCurrent);
      return day >= min && day <= max;
    }
    if (selection) {
      return day >= selection.start && day <= selection.end;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
               <CalendarIcon size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-800">{month}월</h2>
                <p className="text-xs text-gray-400 font-medium">{year} Monthly Planner</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 mb-2">
                    {WEEKDAYS.map((day, i) => (
                        <div key={day} className={`text-center text-xs font-bold py-2 ${i === 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 grid-rows-5 gap-2 flex-1 min-h-[500px]">
                    {Array.from({ length: totalSlots }).map((_, i) => {
                        const dayNumber = i - startDay + 1;
                        const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                        const dateStr = isCurrentMonth ? formatDate(dayNumber) : null;
                        const dayEvents = dateStr ? currentMonthEvents.filter(e => e.date === dateStr) : [];
                        const selected = isCurrentMonth && isSelected(dayNumber);

                        if (!isCurrentMonth) {
                            return <div key={i} className="bg-gray-50/30 rounded-lg border border-transparent"></div>;
                        }

                        return (
                            <div 
                                key={i}
                                onMouseDown={() => handleDayMouseDown(dayNumber)}
                                onMouseEnter={() => handleDayMouseEnter(dayNumber)}
                                className={`
                                    relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 group overflow-hidden
                                    ${selected 
                                        ? 'bg-indigo-50/50 border-indigo-400 ring-1 ring-indigo-400 shadow-md z-10' 
                                        : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                                    }
                                `}
                            >
                                <span className={`text-sm font-bold ${i % 7 === 0 ? 'text-rose-500' : 'text-gray-700'}`}>
                                    {dayNumber}
                                </span>
                                
                                {/* Event Dots/List */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1 pointer-events-none">
                                    {dayEvents.map(event => (
                                        <div key={event.id} className="text-[10px] bg-indigo-100/50 text-indigo-700 px-1.5 py-0.5 rounded truncate font-medium">
                                            {event.content}
                                        </div>
                                    ))}
                                </div>

                                {/* Hover Add Hint */}
                                {!dragStart && (
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <Plus size={14} className="text-indigo-400" />
                                  </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar / Detail View */}
            <div className="w-80 border-l border-gray-100 bg-gray-50/50 p-6 flex flex-col shrink-0">
                {selection ? (
                    <>
                        <div className="mb-4">
                           <h3 className="font-bold text-lg text-gray-800 mb-1">
                             {selection.start === selection.end 
                               ? `${selection.start}일 일정` 
                               : `${selection.start}일 - ${selection.end}일 일정`}
                           </h3>
                           <p className="text-xs text-gray-400">
                             {year}-{String(month).padStart(2, '0')}
                           </p>
                        </div>

                        {/* Add Form */}
                        <form onSubmit={handleAddSubmit} className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newEventContent}
                                    onChange={(e) => setNewEventContent(e.target.value)}
                                    placeholder={selection.start === selection.end ? "새 일정 입력..." : "선택된 기간에 일괄 추가..."}
                                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                                    autoFocus
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newEventContent.trim()}
                                    className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </form>

                        {/* Event List Grouped by Day */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                             {Array.from({ length: selection.end - selection.start + 1 }).map((_, idx) => {
                                const currentDay = selection.start + idx;
                                const dateStr = formatDate(currentDay);
                                const dayEvents = currentMonthEvents.filter(e => e.date === dateStr);

                                if (dayEvents.length === 0) return null;

                                return (
                                  <div key={currentDay} className="mb-4">
                                    <div className="text-xs font-bold text-gray-400 mb-2 border-b border-gray-200 pb-1">
                                      {currentDay}일
                                    </div>
                                    <div className="space-y-2">
                                      {dayEvents.map(event => (
                                          <div key={event.id} className="group bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-start justify-between gap-2 hover:border-indigo-200 transition-colors">
                                              <span className="text-sm text-gray-700 font-medium break-words leading-tight flex-1">
                                                  {event.content}
                                              </span>
                                              <button 
                                                  onClick={() => onDeleteEvent(event.id)}
                                                  className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                             })}
                             
                             {/* Empty State Helper */}
                             {currentMonthEvents.filter(e => {
                               const day = parseInt(e.date.split('-')[2]);
                               return day >= selection.start && day <= selection.end;
                             }).length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-8 italic">등록된 일정이 없습니다.</p>
                             )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 text-center">
                        <CalendarIcon size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">날짜를 드래그하여<br/>일정을 추가하거나 관리하세요.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarModal;
