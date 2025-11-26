import React from 'react';
import { QuarterData } from '../types';

interface GanttChartProps {
  quarters: QuarterData[];
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const getBarColor = (tag: string): string => {
  switch (tag) {
    case 'Launch': return 'bg-rose-500 shadow-rose-200';
    case 'Sales': return 'bg-sky-500 shadow-sky-200';
    case 'Plan': return 'bg-emerald-500 shadow-emerald-200';
    case 'Focus': return 'bg-indigo-500 shadow-indigo-200';
    case 'Work': return 'bg-amber-500 shadow-amber-200';
    default: return 'bg-gray-400 shadow-gray-200';
  }
};

const getQuarterStartCol = (quarterName: string): number => {
  const num = parseInt(quarterName.replace(/[^0-9]/g, '')) || 1;
  // Q1=1(Jan), Q2=4(Apr), Q3=7(Jul), Q4=10(Oct)
  return (num - 1) * 3 + 1;
};

const GanttChart: React.FC<GanttChartProps> = ({ quarters }) => {
  const allItems = quarters.flatMap(q => [
    ...q.productStrategy.map(item => ({ ...item, quarter: q.name, type: 'Product Strategy' })),
    ...q.designProduction.map(item => ({ ...item, quarter: q.name, type: 'Design & Production' }))
  ]);

  return (
    <section className="mt-8 lg:mt-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span className="text-xl">📊</span> 연간 타임라인 대시보드 (Gantt View)
        </h3>
      </div>
      
      <div className="p-6 overflow-x-auto custom-scrollbar">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-[260px_1fr] gap-4 mb-4 border-b border-gray-200 pb-3">
            <div className="font-bold text-xs text-gray-500 uppercase tracking-wider flex items-end px-2">
                Activity & Strategy
            </div>
            <div className="grid grid-cols-12 gap-0 bg-gray-50 rounded-lg py-2 border border-gray-100">
              {MONTHS.map((m, i) => (
                <div key={m} className={`text-center text-xs font-bold text-gray-500 ${i !== 0 ? 'border-l border-gray-200' : ''}`}>
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {allItems.length === 0 ? (
               <div className="py-16 text-center text-gray-300 text-sm">
                  <p className="mb-2">📅 일정이 없습니다.</p>
                  <p className="text-xs opacity-70">위의 분기별 카드에서 항목을 추가하면 타임라인이 생성됩니다.</p>
               </div>
            ) : (
                allItems.map((item, idx) => {
                const startCol = getQuarterStartCol(item.quarter);
                
                return (
                    <div key={`${item.id}-${idx}`} className="grid grid-cols-[260px_1fr] gap-4 items-center group hover:bg-gray-50/60 rounded-lg p-2 transition-colors border border-transparent hover:border-gray-100">
                    {/* Left: Content */}
                    <div className="flex flex-col justify-center pr-4 pl-2">
                        <div className="flex items-center text-sm text-gray-800 font-semibold truncate" title={item.content}>
                            {item.content || <span className="text-gray-300 font-normal italic">내용을 입력하세요</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                             <span className={`w-2 h-2 rounded-full ${getBarColor(item.tag).split(' ')[0]}`}></span>
                             <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{item.quarter} • {item.tag}</span>
                        </div>
                    </div>

                    {/* Right: Bar Area */}
                    <div className="grid grid-cols-12 gap-0 h-10 relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-12 gap-0 rounded-lg bg-gray-50/20 pointer-events-none">
                             {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={`border-l ${i===0 ? 'border-l-transparent' : 'border-gray-100/50'} h-full`}></div>
                            ))}
                        </div>

                        {/* Active Bar */}
                        <div 
                        className={`relative z-10 h-8 my-auto rounded-md shadow-md flex items-center justify-center text-white font-bold transition-transform hover:scale-[1.01] cursor-help ${getBarColor(item.tag)}`}
                        style={{
                            gridColumn: `${startCol} / span 3`,
                            marginLeft: '2px',
                            marginRight: '2px'
                        }}
                        title={`[${item.quarter}] ${item.tag}: ${item.content}`}
                        >
                            <span className="text-[11px] px-2 truncate drop-shadow-md opacity-95 tracking-wide">
                                {item.content || item.tag}
                            </span>
                        </div>
                    </div>
                    </div>
                );
                })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GanttChart;