import React from 'react';
import { Plus } from 'lucide-react';
import { PlanItem } from '../types';
import PlanItemRow from './PlanItemRow';

interface PlanSectionProps {
  title: string;
  items: PlanItem[];
  availableTags: string[];
  onAddItem: () => void;
  onUpdateItem: (id: string, field: keyof PlanItem, value: string) => void;
  onDeleteItem: (id: string) => void;
  headerColor?: string;
}

const PlanSection: React.FC<PlanSectionProps> = ({
  title,
  items,
  availableTags,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  headerColor = "text-gray-700"
}) => {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${headerColor}`}>
          {title}
        </h4>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-full transition-all"
        >
          <Plus size={12} />
          항목 추가
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
            <p className="text-xs text-gray-400">등록된 항목이 없습니다.</p>
          </div>
        )}
        {items.map((item) => (
          <PlanItemRow
            key={item.id}
            item={item}
            availableTags={availableTags}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanSection;