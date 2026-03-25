import React from 'react';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface MonthGridProps {
  currentDate: Date;
  tasks: Task[];
  onCellClick: (date: string, hour: number) => void;
  onTaskClick: (task: Task) => void;
}

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export function MonthGrid({ currentDate, tasks, onCellClick, onTaskClick }: MonthGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = 'yyyy-MM-dd';
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-white rounded-3xl border-4 border-pink-100 overflow-hidden shadow-sm">
      {/* Header Row */}
      <div className="grid grid-cols-7 bg-pink-50/50 border-b-2 border-pink-100">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-3 text-center font-bold text-pink-500 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, dateFormat);
          const dayTasks = tasks
            .filter((t) => t.date === dateStr)
            .sort((a, b) => a.hour - b.hour);
          
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toString()}
              onClick={() => onCellClick(dateStr, 8)} // Default to 8 AM when clicking a day
              className={cn(
                "min-h-[120px] p-2 border-r-2 border-b-2 border-pink-50/50 hover:bg-pink-50/30 cursor-pointer transition-colors relative flex flex-col gap-1",
                !isCurrentMonth && "bg-slate-50/50 text-slate-400 opacity-60",
                idx % 7 === 6 && "border-r-0", // Remove right border for last column
                idx >= calendarDays.length - 7 && "border-b-0" // Remove bottom border for last row
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                    isCurrentDay
                      ? "bg-pink-500 text-white shadow-md"
                      : isCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-400"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs font-semibold truncate transition-transform hover:scale-[1.02] cursor-pointer border shadow-sm",
                      task.color
                    )}
                    title={`${task.hour.toString().padStart(2, '0')}:00 - ${task.title}`}
                  >
                    <span className="opacity-75 mr-1">{task.hour}h</span>
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
