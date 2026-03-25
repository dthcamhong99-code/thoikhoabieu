export type Task = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  hour: number; // 0 to 23
  endHour?: number; // 0 to 24
  title: string;
  description?: string;
  color: string;
};

export const COLORS = [
  'bg-pink-100 text-pink-700 border-pink-300',
  'bg-rose-100 text-rose-700 border-rose-300',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-violet-100 text-violet-700 border-violet-300',
  'bg-indigo-100 text-indigo-700 border-indigo-300',
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-sky-100 text-sky-700 border-sky-300',
  'bg-cyan-100 text-cyan-700 border-cyan-300',
  'bg-teal-100 text-teal-700 border-teal-300',
  'bg-emerald-100 text-emerald-700 border-emerald-300',
  'bg-green-100 text-green-700 border-green-300',
  'bg-lime-100 text-lime-700 border-lime-300',
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-amber-100 text-amber-700 border-amber-300',
  'bg-orange-100 text-orange-700 border-orange-300',
];

export const DAYS = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ nhật',
];

export const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 to 23:00
