
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, CALENDAR_COLORS } from '../types';

interface MonthlyCalendarModalProps {
  isOpen: boolean;
  month: number | null; // 1-12
  year: number;
  events: CalendarEvent[];
  onClose: () => void;
  onRangeSelect: (start: string, end: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MonthlyCalendarModal: React.FC<MonthlyCalendarModalProps> = ({
  isOpen,
  month,
  year,
  events,
  onClose,
  onRangeSelect,
  onEventClick
}) => {
  // Drag State
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);

  // Handle Global Mouse Up to end drag
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStart !== null && dragCurrent !== null && month !== null) {
        const startDay = Math.min(dragStart, dragCurrent);
        const endDay = Math.max(dragStart, dragCurrent);
        
        const startDate = `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        
        onRangeSelect(startDate, endDate);
        
        setDragStart(null);
        setDragCurrent(null);
      } else if (dragStart !== null) {
        setDragStart(null);
        setDragCurrent(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragStart, dragCurrent, month, year, onRangeSelect]);

  if (!isOpen || month === null) return null;

  // Helpers
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();
  const formatDate = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7;

  // Get events that happen this month
  const currentMonthEvents = events.filter(e => {
    const startM = parseInt(e.startDate.split('-')[1]);
    const endM = parseInt(e.endDate.split('-')[1]);
    return startM === month || endM === month || (startM < month && endM > month);
  });

  // Check if a specific day is in an event's range
  const isEventOnDay = (event: CalendarEvent, dayStr: string) => {
    return dayStr >= event.startDate && dayStr <= event.endDate;
  };

  const isSelected = (day: number) => {
    if (dragStart !== null && dragCurrent !== null) {
      const min = Math.min(dragStart, dragCurrent);
      const max = Math.max(dragStart, dragCurrent);
      return day >= min && day <= max;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-gray-900 text-white rounded-lg shadow-sm">
               <CalendarIcon size={20} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{month}월</h2>
                <p className="text-xs text-gray-500 font-medium">{year} Detailed Schedule</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-2">드래그하여 일정 추가</span>
            <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-50/30 select-none">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 mb-2 rounded-t-lg bg-white border border-gray-200 border-b-0">
                {WEEKDAYS.map((day, i) => (
                    <div key={day} className={`text-center text-xs font-bold py-3 uppercase tracking-wider ${i === 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 grid-rows-5 gap-0 flex-1 border-l border-t border-gray-200 bg-white shadow-sm rounded-b-lg overflow-hidden">
                {Array.from({ length: totalSlots }).map((_, i) => {
                    const dayNumber = i - startDay + 1;
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                    const dateStr = isCurrentMonth ? formatDate(dayNumber) : null;
                    const selected = isCurrentMonth && isSelected(dayNumber);

                    if (!isCurrentMonth) {
                        return <div key={i} className="bg-gray-50/50 border-r border-b border-gray-200"></div>;
                    }

                    // Events on this day
                    const dayEvents = dateStr 
                      ? currentMonthEvents.filter(e => isEventOnDay(e, dateStr))
                      : [];

                    return (
                        <div 
                            key={i}
                            onMouseDown={() => setDragStart(dayNumber)}
                            onMouseEnter={() => dragStart !== null && setDragCurrent(dayNumber)}
                            className={`
                                relative p-2 border-r border-b border-gray-200 transition-colors flex flex-col gap-1 overflow-hidden
                                ${selected ? 'bg-indigo-50/60' : 'hover:bg-gray-50/30'}
                            `}
                        >
                            <span className={`text-sm font-bold ${i % 7 === 0 ? 'text-rose-500' : 'text-gray-700'} mb-1`}>
                                {dayNumber}
                            </span>
                            
                            {/* Events List */}
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`
                                            text-[10px] font-medium px-2 py-1 rounded border shadow-sm cursor-pointer truncate transition-transform hover:scale-[1.02]
                                            ${CALENDAR_COLORS[event.color || 'blue']}
                                        `}
                                        title={`${event.title} (${event.startDate} ~ ${event.endDate})`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarModal;
