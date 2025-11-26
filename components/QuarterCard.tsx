import React from 'react';
import { QuarterData, PRODUCT_TAGS, DESIGN_TAGS, PlanItem } from '../types';
import PlanSection from './PlanSection';

interface QuarterCardProps {
  quarter: QuarterData;
  onUpdateTheme: (id: string, theme: string) => void;
  onAddProductItem: (quarterId: string) => void;
  onUpdateProductItem: (quarterId: string, itemId: string, field: keyof PlanItem, value: string) => void;
  onDeleteProductItem: (quarterId: string, itemId: string) => void;
  onAddDesignItem: (quarterId: string) => void;
  onUpdateDesignItem: (quarterId: string, itemId: string, field: keyof PlanItem, value: string) => void;
  onDeleteDesignItem: (quarterId: string, itemId: string) => void;
}

const QuarterCard: React.FC<QuarterCardProps> = ({
  quarter,
  onUpdateTheme,
  onAddProductItem,
  onUpdateProductItem,
  onDeleteProductItem,
  onAddDesignItem,
  onUpdateDesignItem,
  onDeleteDesignItem
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-2xl font-black text-gray-800 font-sans">{quarter.name}</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">2026</span>
        </div>
        <input
          type="text"
          value={quarter.theme}
          onChange={(e) => onUpdateTheme(quarter.id, e.target.value)}
          placeholder={`${quarter.name} 메인 테마 입력`}
          className="w-full bg-transparent text-sm font-medium text-gray-600 placeholder-gray-300 focus:outline-none border-b border-transparent focus:border-gray-300 pb-0.5 transition-colors"
        />
      </div>

      {/* Body */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {/* Section 1: Product Strategy */}
        <PlanSection
          title="Product / Line-up Strategy"
          items={quarter.productStrategy}
          availableTags={PRODUCT_TAGS}
          onAddItem={() => onAddProductItem(quarter.id)}
          onUpdateItem={(itemId, field, value) => onUpdateProductItem(quarter.id, itemId, field, value)}
          onDeleteItem={(itemId) => onDeleteProductItem(quarter.id, itemId)}
          headerColor="text-slate-600"
        />

        <div className="my-6 border-t border-dashed border-gray-100"></div>

        {/* Section 2: Design & Production */}
        <PlanSection
          title="Design & Production"
          items={quarter.designProduction}
          availableTags={DESIGN_TAGS}
          onAddItem={() => onAddDesignItem(quarter.id)}
          onUpdateItem={(itemId, field, value) => onUpdateDesignItem(quarter.id, itemId, field, value)}
          onDeleteItem={(itemId) => onDeleteDesignItem(quarter.id, itemId)}
          headerColor="text-slate-600"
        />
      </div>
    </div>
  );
};

export default QuarterCard;