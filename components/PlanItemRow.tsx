import React from 'react';
import { Trash2 } from 'lucide-react';
import { PlanItem } from '../types';

interface PlanItemRowProps {
  item: PlanItem;
  availableTags: string[];
  onUpdate: (id: string, field: keyof PlanItem, value: string) => void;
  onDelete: (id: string) => void;
}

const getTagColor = (tag: string): string => {
  switch (tag) {
    case 'Launch':
      return 'bg-red-50 text-red-600 border-red-100';
    case 'Sales':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Plan':
      return 'bg-green-50 text-green-600 border-green-100';
    case 'Focus':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'Work':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const PlanItemRow: React.FC<PlanItemRowProps> = ({ item, availableTags, onUpdate, onDelete }) => {
  return (
    <div className="flex items-center gap-2 mb-2 group">
      <div className="relative">
        <select
          value={item.tag}
          onChange={(e) => onUpdate(item.id, 'tag', e.target.value)}
          className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-md border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-100 transition-all ${getTagColor(item.tag)}`}
        >
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {/* Custom arrow icon for select if needed, but default is fine for now, or we can hide it. 
            Let's keep it simple and native for accessibility but styled. */}
      </div>

      <input
        type="text"
        value={item.content}
        onChange={(e) => onUpdate(item.id, 'content', e.target.value)}
        placeholder="내용을 입력하세요..."
        className="flex-1 py-1.5 px-3 text-sm text-gray-700 bg-gray-50/50 border border-gray-200 rounded-md focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400"
      />

      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="삭제"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default PlanItemRow;