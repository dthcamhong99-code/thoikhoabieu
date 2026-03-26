import React from 'react';
import { X, Sun, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export function DailySummaryModal({ isOpen, onClose, tasks }: DailySummaryModalProps) {
  if (!isOpen) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks
    .filter((t) => t.date === todayStr)
    .sort((a, b) => a.hour - b.hour);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pink-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-pink-100 transform transition-all">
        <div className="bg-gradient-to-b from-pink-100 to-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border-2 border-pink-200">
            <Sun size={32} className="text-amber-400 fill-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-pink-500 mb-1">Chào buổi sáng!</h2>
          <p className="text-slate-600 font-medium text-sm">
            Hôm nay ({format(new Date(), 'dd/MM', { locale: vi })}) bạn có <strong className="text-pink-500">{todayTasks.length}</strong> công việc
          </p>
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {todayTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-medium">
              Bạn chưa có công việc nào cho hôm nay. <br/> Hãy tận hưởng ngày mới nhé! 🌸
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "p-3 rounded-2xl border-2 flex gap-3 items-start",
                    task.color || "bg-pink-50 border-pink-100 text-pink-700"
                  )}
                >
                  <div className="bg-white/60 px-2 py-1 rounded-lg flex flex-col items-center justify-center min-w-[50px] border border-white/50 shadow-sm">
                    <span className="text-xs font-bold opacity-80">
                      {task.hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-tight mb-0.5">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs font-medium opacity-80 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t-2 border-pink-50 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-pink-400 text-white rounded-2xl hover:bg-pink-500 transition-all shadow-md hover:shadow-lg font-bold text-lg flex items-center justify-center gap-2"
          >
            {todayTasks.length === 0 ? "Đóng" : "Bắt đầu ngày mới ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
