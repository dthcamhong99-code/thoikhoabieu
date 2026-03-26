import React, { useState, useRef, useEffect } from 'react';
import { CalendarHeart, Download, Image as ImageIcon, Plus, ChevronLeft, ChevronRight, Bell, BellRing, ListTodo } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { startOfWeek, addDays, format, subWeeks, addWeeks, subMonths, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task } from './types';
import { ScheduleGrid } from './components/ScheduleGrid';
import { MonthGrid } from './components/MonthGrid';
import { TaskModal } from './components/TaskModal';
import { DailySummaryModal } from './components/DailySummaryModal';
import { cn } from './lib/utils';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('weekly-schedule-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((t: any) => typeof t.date === 'string');
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>('default');
  const scheduleRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    localStorage.setItem('weekly-schedule-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifyPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const checkPeriodicTasks = () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');

      // 1. Daily Summary Check (Shows once per day)
      const lastShownDate = localStorage.getItem('lastShownSummaryDate');
      if (lastShownDate !== todayStr) {
        const hasTasksToday = tasks.some(t => t.date === todayStr);
        if (hasTasksToday) {
          setShowSummary(true);
          localStorage.setItem('lastShownSummaryDate', todayStr);
        }
      }

      // 2. Notification Check
      if (notifyPermission === 'granted') {
        const todayTasks = tasks.filter(t => t.date === todayStr);
        const notifiedKey = `notified-${todayStr}`;
        const notifiedTasks: string[] = JSON.parse(localStorage.getItem(notifiedKey) || '[]');
        let newlyNotified = false;

        todayTasks.forEach(task => {
          if (notifiedTasks.includes(task.id)) return;

          const taskTime = new Date(now);
          taskTime.setHours(task.hour, 0, 0, 0);
          
          const diffMins = Math.floor((taskTime.getTime() - now.getTime()) / 60000);
          
          // Notify if task is starting in 60 minutes or less (down to 0 mins)
          if (diffMins > 0 && diffMins <= 60) {
            new Notification('⏰ Nhắc nhở công việc!', {
              body: `"${task.title}" sẽ bắt đầu lúc ${task.hour.toString().padStart(2, '0')}:00.`,
              icon: '/vite.svg'
            });
            notifiedTasks.push(task.id);
            newlyNotified = true;
          }
        });

        if (newlyNotified) {
          localStorage.setItem(notifiedKey, JSON.stringify(notifiedTasks));
        }
      }
    };

    // Check immediately, then every minute
    checkPeriodicTasks();
    const interval = setInterval(checkPeriodicTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, notifyPermission]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Trình duyệt hoặc thiết bị của bạn không hỗ trợ thông báo.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifyPermission(permission);
    if (permission === 'granted') {
      alert('Đã bật thông báo thành công! Bạn sẽ nhận được nhắc nhở trước 1 tiếng.');
    } else {
      alert('Bạn đã từ chối cấp quyền thông báo. Vui lòng cấp quyền trong cài đặt trình duyệt để nhận nhắc nhở.');
    }
  };

  const handlePrev = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => setCurrentDate(new Date());

  const handleAddClick = () => {
    setSelectedTask(null);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleCellClick = (date: string, hour: number) => {
    setSelectedTask(null);
    setSelectedSlot({ date, hour });
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...taskData, id: t.id } : t));
    } else {
      setTasks([...tasks, { ...taskData, id: Math.random().toString(36).substr(2, 9) }]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const exportAsImage = async () => {
    if (!scheduleRef.current) return;
    try {
      const dataUrl = await toJpeg(scheduleRef.current, { 
        quality: 0.85, 
        pixelRatio: 1.5,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `thoi-khoa-bieu-${format(weekStart, 'dd-MM-yyyy')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Có lỗi xảy ra khi xuất ảnh.');
    }
  };

  const exportAsPDF = async () => {
    if (!scheduleRef.current) return;
    try {
      const dataUrl = await toJpeg(scheduleRef.current, { 
        quality: 0.85, 
        pixelRatio: 1.5,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const width = scheduleRef.current.offsetWidth;
      const height = scheduleRef.current.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
        compress: true
      });
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');
      pdf.save(`thoi-khoa-bieu-${format(weekStart, 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF.');
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-20 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-100 text-pink-500 rounded-2xl shadow-inner">
              <CalendarHeart size={26} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thời Khóa Biểu Tuần 🌸</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-100 text-pink-500 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm font-semibold"
              title="Tóm tắt công việc hôm nay"
            >
              <ListTodo size={18} />
              <span className="hidden sm:inline">Tóm tắt</span>
            </button>
            <div className="h-8 w-px bg-pink-100 mx-1 hidden sm:block"></div>
            <button
              onClick={requestNotificationPermission}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 border-2 rounded-full transition-all shadow-sm font-semibold",
                notifyPermission === 'granted' 
                  ? "bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100" 
                  : "bg-white border-pink-100 text-slate-500 hover:bg-slate-50"
              )}
              title="Bật thông báo nhắc nhở"
            >
              {notifyPermission === 'granted' ? <BellRing size={18} /> : <Bell size={18} />}
              <span className="hidden sm:inline">Nhắc nhở</span>
            </button>
            <div className="h-8 w-px bg-pink-100 mx-1 hidden sm:block"></div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 text-white rounded-full hover:bg-pink-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-semibold"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Thêm việc</span>
            </button>
            <div className="h-8 w-px bg-pink-100 mx-1"></div>
            <button
              onClick={exportAsImage}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-100 text-pink-600 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm font-semibold"
              title="Xuất file ảnh (JPG)"
            >
              <ImageIcon size={18} />
              <span className="hidden sm:inline">Ảnh</span>
            </button>
            <button
              onClick={exportAsPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-100 text-pink-600 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm font-semibold"
              title="Xuất file PDF"
            >
              <Download size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-medium">
            ✨ Nhấn vào ô trống để thêm việc, hoặc nhấn vào việc đã có để sửa nhé!
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1 rounded-full border-2 border-pink-100 shadow-sm">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-4 py-1.5 text-sm font-bold rounded-full transition-colors",
                  viewMode === 'week' ? "bg-pink-100 text-pink-600" : "text-slate-500 hover:text-pink-500"
                )}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-4 py-1.5 text-sm font-bold rounded-full transition-colors",
                  viewMode === 'month' ? "bg-pink-100 text-pink-600" : "text-slate-500 hover:text-pink-500"
                )}
              >
                Tháng
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border-2 border-pink-100 shadow-sm">
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-pink-50 text-pink-400 hover:text-pink-600 rounded-full transition-colors"
                title={viewMode === 'week' ? "Tuần trước" : "Tháng trước"}
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 text-sm font-bold text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                title="Trở về hiện tại"
              >
                {viewMode === 'week' 
                  ? `${format(weekDates[0], 'dd/MM')} - ${format(weekDates[6], 'dd/MM')}`
                  : `Tháng ${format(currentDate, 'M/yyyy')}`}
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-pink-50 text-pink-400 hover:text-pink-600 rounded-full transition-colors"
                title={viewMode === 'week' ? "Tuần sau" : "Tháng sau"}
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh] md:max-h-[calc(100vh-240px)] pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
          {/* Wrap the grid in a div that we will capture for export */}
          <div 
            ref={scheduleRef} 
            className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 border-4 border-white min-w-[600px] md:min-w-[800px] lg:min-w-[1200px]"
          >
            <div className="mb-6 text-center">
              <h2 className="text-4xl text-pink-500 font-cute mb-2">
                Kế Hoạch {viewMode === 'week' ? 'Tuần' : 'Tháng'} ✨
              </h2>
              <p className="text-pink-400 font-medium mt-1 bg-pink-50 inline-block px-4 py-1 rounded-full border border-pink-100">
                {viewMode === 'week' 
                  ? `${format(weekDates[0], 'dd/MM/yyyy')} - ${format(weekDates[6], 'dd/MM/yyyy')}`
                  : `Tháng ${format(currentDate, 'M - yyyy')}`}
              </p>
            </div>
            
            {viewMode === 'week' ? (
              <ScheduleGrid 
                tasks={tasks} 
                weekDates={weekDates}
                onCellClick={handleCellClick} 
                onTaskClick={handleTaskClick} 
              />
            ) : (
              <MonthGrid
                currentDate={currentDate}
                tasks={tasks}
                onCellClick={handleCellClick}
                onTaskClick={handleTaskClick}
              />
            )}
          </div>
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={selectedTask}
        selectedDate={selectedSlot?.date}
        selectedHour={selectedSlot?.hour}
        weekDates={weekDates}
      />

      <DailySummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        tasks={tasks}
      />
    </div>
  );
}
