
import React from 'react';
import { TimelineRow, TimelineItem, TAG_COLORS } from '../types';

interface TimelineTrackProps {
  row: TimelineRow;
  items: TimelineItem[];
  dragState: { rowId: string; start: number; end: number } | null;
  onDragStart: (rowId: string, month: number) => void;
  onDragEnter: (rowId: string, month: number) => void;
  onDragEnd: () => void;
  onItemClick: (item: TimelineItem) => void;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  row,
  items,
  dragState,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onItemClick
}) => {
  const isDraggingThisRow = dragState?.rowId === row.id;

  // Helper to render background grid cells
  const renderCells = () => {
    return Array.from({ length: 12 }).map((_, index) => {
      const month = index + 1;
      const isSelected =
        isDraggingThisRow &&
        month >= Math.min(dragState.start, dragState.end) &&
        month <= Math.max(dragState.start, dragState.end);

      return (
        <div
          key={month}
          className={`
            h-14 border-r border-gray-100 last:border-r-0 transition-colors duration-75 select-none
            ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-gray-50/30'}
          `}
          onMouseDown={() => onDragStart(row.id, month)}
          onMouseEnter={() => onDragEnter(row.id, month)}
          onMouseUp={onDragEnd}
        />
      );
    });
  };

  return (
    <div className="relative border-b border-gray-100 group">
      {/* Background Grid */}
      <div className="grid grid-cols-12 w-full">
        {renderCells()}
      </div>

      {/* Render Items */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="grid grid-cols-12 w-full h-full">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering row clicks
                onItemClick(item);
              }}
              className={`
                relative mx-[2px] my-2 rounded-md shadow-sm cursor-pointer pointer-events-auto 
                flex items-center justify-center group/item overflow-hidden transition-transform hover:scale-[1.02] hover:z-10 hover:shadow-md
                ${TAG_COLORS[item.tag]}
              `}
              style={{
                gridColumnStart: item.startMonth,
                gridColumnEnd: item.endMonth + 1,
              }}
              title={`${item.title} (${item.tag})`}
            >
              <span className="text-white text-[11px] font-bold truncate px-2 drop-shadow-sm">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Drag Visual Helper (if needed for clearer selection borders, optional) */}
      {isDraggingThisRow && (
        <div className="absolute inset-0 w-full h-full pointer-events-none grid grid-cols-12">
          <div
            className="bg-indigo-400/10 border-2 border-indigo-400 rounded-sm mx-[2px] my-2"
            style={{
              gridColumnStart: Math.min(dragState.start, dragState.end),
              gridColumnEnd: Math.max(dragState.start, dragState.end) + 1,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TimelineTrack;
