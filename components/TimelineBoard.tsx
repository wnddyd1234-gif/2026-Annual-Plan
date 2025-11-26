
import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TimelineRow, TimelineItem } from '../types';
import TimelineTrack from './TimelineTrack';

interface TimelineBoardProps {
  rows: TimelineRow[];
  items: TimelineItem[];
  onAddRow: () => void;
  onRangeSelected: (rowId: string, start: number, end: number) => void;
  onItemClick: (item: TimelineItem) => void;
  onMonthClick: (month: number) => void; // Added prop
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const TimelineBoard: React.FC<TimelineBoardProps> = ({
  rows,
  items,
  onAddRow,
  onRangeSelected,
  onItemClick,
  onMonthClick
}) => {
  const [dragState, setDragState] = useState<{ rowId: string; start: number; end: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Global mouse up handler to ensure dragging stops even if mouse leaves the cell
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState) {
        onRangeSelected(dragState.rowId, Math.min(dragState.start, dragState.end), Math.max(dragState.start, dragState.end));
        setDragState(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragState, onRangeSelected]);

  const handleDragStart = (rowId: string, month: number) => {
    setDragState({ rowId, start: month, end: month });
  };

  const handleDragEnter = (rowId: string, month: number) => {
    if (dragState && dragState.rowId === rowId) {
      setDragState((prev) => prev ? { ...prev, end: month } : null);
    }
  };

  const handleDragEnd = () => {
    // Handled by global mouse up
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" ref={boardRef}>
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-20">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span>📅</span> Annual Timeline
        </h3>
        <button
          onClick={onAddRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-md active:scale-95"
        >
          <Plus size={14} />
          행 추가 (Add Track)
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px]">
          {/* Header Month Grid */}
          <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => onMonthClick(i + 1)}
                className={`
                  py-2 text-center text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors
                  ${i > 0 ? 'border-l border-gray-200' : ''}
                `}
                title={`${m} 상세 일정 보기`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Tracks */}
          <div className="divide-y divide-gray-100 bg-white min-h-[300px] select-none">
             {rows.length === 0 && (
               <div className="flex flex-col items-center justify-center h-40 text-gray-300 text-sm">
                 <p>트랙이 없습니다. [행 추가] 버튼을 눌러 시작하세요.</p>
               </div>
             )}
             {rows.map((row) => (
               <TimelineTrack
                 key={row.id}
                 row={row}
                 items={items.filter(i => i.rowId === row.id)}
                 dragState={dragState}
                 onDragStart={handleDragStart}
                 onDragEnter={handleDragEnter}
                 onDragEnd={handleDragEnd}
                 onItemClick={onItemClick}
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineBoard;
