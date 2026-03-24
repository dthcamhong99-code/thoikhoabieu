import React from 'react';
import { format, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task, HOURS } from '../types';
import { cn } from '../lib/utils';

interface ScheduleGridProps {
  tasks: Task[];
  weekDates: Date[];
  onCellClick: (date: string, hour: number) => void;
  onTaskClick: (task: Task) => void;
}

const DAY_EMOJIS = ['🌙', '🌸', '🍀', '☀️', '🎀', '🎈', '🍰'];

export function ScheduleGrid({ tasks, weekDates, onCellClick, onTaskClick }: ScheduleGridProps) {
  // Helper to get tasks for a specific slot
  const getTasksForSlot = (dateStr: string, hour: number) => {
    return tasks.filter((t) => t.date === dateStr && t.hour === hour);
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border-2 border-pink-100 overflow-hidden">
      <div className="w-full">
        {/* Header Row */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b-2 border-pink-100 bg-pink-50/50 sticky top-0 z-10">
          <div className="p-3 text-center text-sm font-bold text-pink-400 border-r-2 border-pink-100 flex items-center justify-center">
            Giờ ⏰
          </div>
          {weekDates.map((date, index) => {
            const isCurrentDay = isToday(date);
            const isWeekend = index === 5 || index === 6;
            const emoji = DAY_EMOJIS[date.getDay() === 0 ? 6 : date.getDay() - 1];
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "p-3 text-center border-r-2 border-pink-100 last:border-r-0 transition-colors",
                  isCurrentDay ? "bg-pink-100/50" : ""
                )}
              >
                <div className={cn(
                  "text-sm font-bold capitalize flex items-center justify-center gap-1",
                  isCurrentDay ? "text-pink-600" : isWeekend ? "text-rose-500" : "text-slate-600"
                )}>
                  {format(date, 'EEEE', { locale: vi })} {emoji}
                </div>
                <div className={cn(
                  "text-xs mt-1 font-medium",
                  isCurrentDay ? "text-pink-500 bg-pink-200/50 inline-block px-2 py-0.5 rounded-full" : "text-slate-400"
                )}>
                  {format(date, 'dd/MM')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div className="divide-y-2 divide-pink-50">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] group">
              {/* Time Column */}
              <div className="p-2 text-center text-xs font-bold text-pink-400 border-r-2 border-pink-100 bg-pink-50/30 flex items-center justify-center">
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Day Columns */}
              {weekDates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const slotTasks = getTasksForSlot(dateStr, hour);
                const isCurrentDay = isToday(date);
                
                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    onClick={() => onCellClick(dateStr, hour)}
                    className={cn(
                      "relative min-h-[85px] p-1.5 border-r-2 border-pink-50 last:border-r-0 hover:bg-pink-50/50 cursor-pointer transition-colors border-dashed",
                      isCurrentDay ? "bg-pink-50/30" : ""
                    )}
                  >
                    <div className="flex flex-col gap-1.5 h-full">
                      {slotTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          className={cn(
                            "p-2 rounded-xl border-2 shadow-sm transition-all hover:scale-[1.03] hover:-rotate-1 cursor-pointer overflow-hidden",
                            task.color
                          )}
                          title={task.description}
                        >
                          <div className="font-bold truncate text-xs leading-tight">{task.title}</div>
                          {task.description && (
                            <div className="truncate opacity-80 mt-1 text-[10px] font-medium">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
