
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { TimelineItem, TagType, TAGS, TAG_COLORS } from '../types';

interface EventModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData: Partial<TimelineItem>;
  onClose: () => void;
  onSave: (data: { title: string; tag: TagType }) => void;
  onDelete?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<TagType>('Launch');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title || '');
      setTag(initialData.tag || 'Launch');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, tag });
  };

  const monthRange = initialData.startMonth === initialData.endMonth 
    ? `${initialData.startMonth}월`
    : `${initialData.startMonth}월 - ${initialData.endMonth}월`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 transition-transform">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">
            {mode === 'create' ? '새 일정 추가' : '일정 수정'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">기간</label>
            <div className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
              {monthRange}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">이벤트 이름</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm"
              placeholder="예: 신제품 런칭, 프로모션"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">태그</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    tag === t
                      ? `${TAG_COLORS[t]} text-white border-transparent shadow-sm`
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex-none px-3 py-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
