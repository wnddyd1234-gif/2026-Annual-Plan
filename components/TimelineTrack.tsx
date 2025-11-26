import React, { useState } from 'react';
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

// 이벤트들을 행(row)별로 배치하는 알고리즘
const assignRowsToItems = (items: TimelineItem[]): Map<string, number> => {
  const rowAssignments = new Map<string, number>();
  const rows: { start: number; end: number }[][] = [];

  // startMonth 순으로 정렬
  const sortedItems = [...items].sort((a, b) => a.startMonth - b.startMonth);

  for (const item of sortedItems) {
    let assignedRow = -1;

    // 기존 행들 중에서 겹치지 않는 첫 번째 행 찾기
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const hasOverlap = row.some(
        (existing) =>
          item.startMonth <= existing.end && item.endMonth >= existing.start
      );

      if (!hasOverlap) {
        assignedRow = rowIndex;
        break;
      }
    }

    // 겹치지 않는 행이 없으면 새 행 생성
    if (assignedRow === -1) {
      assignedRow = rows.length;
      rows.push([]);
    }

    rows[assignedRow].push({ start: item.startMonth, end: item.endMonth });
    rowAssignments.set(item.id, assignedRow);
  }

  return rowAssignments;
};

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  row,
  items,
  dragState,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onItemClick
}) => {
  const [showAllItems, setShowAllItems] = useState(false);
  const isDraggingThisRow = dragState?.rowId === row.id;

  // 이벤트들에 행 번호 할당
  const rowAssignments = assignRowsToItems(items);
  
  // 최대 행 수 계산
  const maxRow = Math.max(-1, ...Array.from(rowAssignments.values())) + 1;
  
  // 표시할 최대 행 수 (2행까지만 표시, 나머지는 더보기)
  const MAX_VISIBLE_ROWS = 2;
  const hasHiddenItems = maxRow > MAX_VISIBLE_ROWS && !showAllItems;
  
  // 숨겨진 아이템 수
  const hiddenItemsCount = hasHiddenItems 
    ? items.filter(item => (rowAssignments.get(item.id) || 0) >= MAX_VISIBLE_ROWS).length 
    : 0;

  // 표시할 행 수
  const visibleRows = showAllItems ? maxRow : Math.min(maxRow, MAX_VISIBLE_ROWS);
  
  // 트랙 높이 계산 (각 행 32px + 패딩)
  const ROW_HEIGHT = 32;
  const trackHeight = Math.max(1, visibleRows) * ROW_HEIGHT + (hasHiddenItems ? 24 : 0) + 8;

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
            border-r border-gray-100 last:border-r-0 transition-colors duration-75 select-none
            ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-gray-50/30'}
          `}
          style={{ height: `${trackHeight}px` }}
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
      <div className="absolute inset-0 w-full pointer-events-none" style={{ height: `${trackHeight}px` }}>
        <div className="relative w-full h-full">
          {items.map((item) => {
            const itemRow = rowAssignments.get(item.id) || 0;
            
            // 숨겨진 행의 아이템은 렌더링하지 않음
            if (!showAllItems && itemRow >= MAX_VISIBLE_ROWS) {
              return null;
            }

            // 위치 계산
            const left = ((item.startMonth - 1) / 12) * 100;
            const width = ((item.endMonth - item.startMonth + 1) / 12) * 100;
            const top = itemRow * ROW_HEIGHT + 4;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(item);
                }}
                className={`
                  absolute h-7 rounded-md shadow-sm cursor-pointer pointer-events-auto 
                  flex items-center justify-center overflow-hidden transition-all
                  hover:scale-[1.02] hover:z-20 hover:shadow-md
                  ${TAG_COLORS[item.tag]}
                `}
                style={{
                  left: `calc(${left}% + 2px)`,
                  width: `calc(${width}% - 4px)`,
                  top: `${top}px`,
                }}
                title={`${item.title} (${item.tag})`}
              >
                <span className="text-white text-xs font-bold truncate px-2 drop-shadow-sm">
                  {item.title}
                </span>
              </div>
            );
          })}

          {/* 더보기 버튼 */}
          {hasHiddenItems && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllItems(true);
              }}
              className="absolute left-2 bottom-1 px-2 py-0.5 text-xs font-medium text-indigo-600 
                         bg-indigo-50 hover:bg-indigo-100 rounded-full pointer-events-auto
                         transition-colors cursor-pointer"
            >
              +{hiddenItemsCount}개 더보기
            </button>
          )}

          {/* 접기 버튼 */}
          {showAllItems && maxRow > MAX_VISIBLE_ROWS && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllItems(false);
              }}
              className="absolute left-2 bottom-1 px-2 py-0.5 text-xs font-medium text-gray-500 
                         bg-gray-100 hover:bg-gray-200 rounded-full pointer-events-auto
                         transition-colors cursor-pointer"
            >
              접기
            </button>
          )}
        </div>
      </div>
      
      {/* Drag Visual Helper */}
      {isDraggingThisRow && (
        <div 
          className="absolute inset-0 w-full pointer-events-none"
          style={{ height: `${trackHeight}px` }}
        >
          <div
            className="absolute bg-indigo-400/10 border-2 border-indigo-400 rounded-sm top-1 bottom-1"
            style={{
              left: `calc(${((Math.min(dragState.start, dragState.end) - 1) / 12) * 100}% + 2px)`,
              width: `calc(${((Math.max(dragState.start, dragState.end) - Math.min(dragState.start, dragState.end) + 1) / 12) * 100}% - 4px)`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TimelineTrack;