import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task, COLORS } from '../types';
import { cn } from '../lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onDelete?: (id: string) => void;
  initialData?: Task | null;
  selectedDate?: string;
  selectedHour?: number;
  weekDates: Date[];
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  selectedDate,
  selectedHour,
  weekDates,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [dateStr, setDateStr] = useState(selectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [hour, setHour] = useState(selectedHour ?? 6);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setColor(initialData.color);
      setDateStr(initialData.date);
      setHour(initialData.hour);
    } else {
      setTitle('');
      setDescription('');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setDateStr(selectedDate || format(new Date(), 'yyyy-MM-dd'));
      setHour(selectedHour ?? 6);
    }
  }, [initialData, selectedDate, selectedHour, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      color,
      date: dateStr,
      hour,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-900/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-pink-50">
        <div className="flex items-center justify-between p-5 border-b-2 border-pink-50 bg-pink-50/30">
          <h2 className="text-xl font-bold text-pink-500 flex items-center gap-2">
            <Heart size={20} className="text-pink-400 fill-pink-400" />
            {initialData ? 'Sửa công việc' : 'Thêm công việc mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tiêu đề 📝
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Họp nhóm, Đi chơi..."
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-slate-700 placeholder:text-slate-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Mô tả chi tiết (Tùy chọn) 💭
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all resize-none font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Ngày 📅
              </label>
              <select
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
              >
                {weekDates.map((d) => (
                  <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                    {format(d, 'EEEE, dd/MM', { locale: vi })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Giờ ⏰
              </label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2.5">
              Màu sắc yêu thích 🎨
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 transition-all shadow-sm',
                    c.split(' ')[0], // Get the bg color class
                    color === c ? 'scale-125 border-slate-700 shadow-md z-10' : 'border-transparent hover:scale-110 hover:shadow-md'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t-2 border-pink-50 mt-6">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="px-5 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors mr-auto font-bold"
              >
                Xóa
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 bg-pink-400 text-white rounded-full hover:bg-pink-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
