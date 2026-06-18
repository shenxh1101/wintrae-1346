import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutRecord, WeeklyStat } from '@/types';
import { mockRecords } from '@/data/mockData';

interface HistoryState {
  records: WorkoutRecord[];
  addRecord: (record: WorkoutRecord) => void;
  getMemberRecords: (memberId: string) => WorkoutRecord[];
  getMemberStats: (memberId: string) => {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    avgCompletionRate: number;
    streakDays: number;
  };
  getWeeklyStats: (memberId: string) => WeeklyStat[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: mockRecords,

      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records],
        })),

      getMemberRecords: (memberId) => {
        return get()
          .records.filter((r) => r.memberId === memberId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getMemberStats: (memberId) => {
        const records = get().records.filter((r) => r.memberId === memberId);
        if (records.length === 0) {
          return {
            totalWorkouts: 0,
            totalDuration: 0,
            totalCalories: 0,
            avgCompletionRate: 0,
            streakDays: 0,
          };
        }

        const totalWorkouts = records.length;
        const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
        const totalCalories = records.reduce((sum, r) => sum + r.calories, 0);
        const avgCompletionRate = Math.round(
          records.reduce((sum, r) => sum + r.completionRate, 0) / records.length
        );

        const dates = [...new Set(records.map((r) => r.date))].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );

        let streakDays = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date();

        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (dates.includes(dateStr)) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (dateStr === today) {
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          totalWorkouts,
          totalDuration,
          totalCalories,
          avgCompletionRate,
          streakDays,
        };
      },

      getWeeklyStats: (memberId) => {
        const records = get().records.filter((r) => r.memberId === memberId);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const result: WeeklyStat[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayRecords = records.filter((r) => r.date === dateStr);
          const duration = dayRecords.reduce((sum, r) => sum + r.duration, 0);

          result.push({
            day: weekDays[date.getDay()],
            duration,
            date: dateStr,
          });
        }

        return result;
      },
    }),
    {
      name: 'history-storage',
    }
  )
);
