
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CalendarEvent, CALENDAR_COLORS } from '../types';

interface CalendarEventModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData: Partial<CalendarEvent>;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState<keyof typeof CALENDAR_COLORS>('blue');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title || '');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setColor((initialData.color as keyof typeof CALENDAR_COLORS) || 'blue');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;
    onSave({ title, startDate, endDate, color });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 transition-transform">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">
            {mode === 'create' ? '일정 추가' : '일정 수정'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1 placeholder-gray-300 transition-colors"
              placeholder="일정 제목 입력"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                   <CalendarIcon size={10} /> 시작일
                </label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-200 outline-none"
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                   <Clock size={10} /> 종료일
                </label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-200 outline-none"
                />
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">색상 선택</label>
            <div className="flex gap-2">
              {(Object.keys(CALENDAR_COLORS) as Array<keyof typeof CALENDAR_COLORS>).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-400 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c === 'red' ? '#fda4af' : c === 'blue' ? '#7dd3fc' : c === 'green' ? '#6ee7b7' : c === 'purple' ? '#a5b4fc' : '#fcd34d' }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-bold shadow hover:bg-black transition-all disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventModal;
