import React, { useState, useRef, useEffect } from 'react';
import { CalendarHeart, Download, Image as ImageIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { startOfWeek, addDays, format, subWeeks, addWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Task } from './types';
import { ScheduleGrid } from './components/ScheduleGrid';
import { TaskModal } from './components/TaskModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    localStorage.setItem('weekly-schedule-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
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
      const dataUrl = await toPng(scheduleRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `thoi-khoa-bieu-${format(weekStart, 'dd-MM-yyyy')}.png`;
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
      const dataUrl = await toPng(scheduleRef.current, { 
        quality: 1, 
        pixelRatio: 2,
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
        format: [width, height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`thoi-khoa-bieu-${format(weekStart, 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF.');
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-100 text-pink-500 rounded-2xl shadow-inner">
              <CalendarHeart size={26} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thời Khóa Biểu Tuần 🌸</h1>
          </div>
          
          <div className="flex items-center gap-3">
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
              title="Xuất file ảnh (PNG)"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-medium">
            ✨ Nhấn vào ô trống để thêm việc, hoặc nhấn vào việc đã có để sửa nhé!
          </p>
          
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border-2 border-pink-100 shadow-sm">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-pink-50 text-pink-400 hover:text-pink-600 rounded-full transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-1.5 text-sm font-bold text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
              title="Trở về tuần hiện tại"
            >
              {format(weekDates[0], 'dd/MM')} - {format(weekDates[6], 'dd/MM')}
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-pink-50 text-pink-400 hover:text-pink-600 rounded-full transition-colors"
              title="Tuần sau"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Wrap the grid in a div that we will capture for export */}
          <div 
            ref={scheduleRef} 
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 border-4 border-white min-w-[800px]"
          >
            <div className="mb-6 text-center">
              <h2 className="text-4xl text-pink-500 font-cute mb-2">
                Kế Hoạch Tuần ✨
              </h2>
              <p className="text-pink-400 font-medium mt-1 bg-pink-50 inline-block px-4 py-1 rounded-full border border-pink-100">
                {format(weekDates[0], 'dd/MM/yyyy')} - {format(weekDates[6], 'dd/MM/yyyy')}
              </p>
            </div>
            
            <ScheduleGrid 
              tasks={tasks} 
              weekDates={weekDates}
              onCellClick={handleCellClick} 
              onTaskClick={handleTaskClick} 
            />
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
    </div>
  );
}
