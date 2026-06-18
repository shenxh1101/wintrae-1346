import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutRecord, WeeklyStat, WeeklyReport, CourseCategory } from '@/types';
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
  getWeeklyReport: (memberId: string, memberName: string) => WeeklyReport;
  getFavoriteCategory: (memberId: string) => CourseCategory | null;
}

function generateAdvice(
  totalWorkouts: number,
  avgCompletionRate: number,
  favoriteCategory: CourseCategory | null,
  streakDays: number
): string {
  if (totalWorkouts === 0) {
    return '开启你的第一次训练吧！哪怕只有5分钟，也是好的开始。';
  }

  if (totalWorkouts < 3) {
    return '训练频率可以再提高一些，建议每周至少运动3-4次，循序渐进养成习惯。';
  }

  if (avgCompletionRate < 60) {
    return '可以先选择难度低一些的课程，保证完成质量比追求强度更重要。';
  }

  if (streakDays >= 7) {
    return `太棒了！已经连续坚持${streakDays}天了，继续保持这个节奏，你会看到明显的进步！`;
  }

  if (favoriteCategory === 'stretch' || favoriteCategory === 'neck') {
    return '你喜欢放松类的训练，非常棒！可以搭配一些轻度力量训练，让身体更有活力。';
  }

  if (favoriteCategory === 'fatburn') {
    return '燃脂训练效果不错！记得训练后充分拉伸，同时配合合理饮食效果更好。';
  }

  if (favoriteCategory === 'strength') {
    return '力量训练很有规律！建议不同肌群交替训练，给肌肉足够的恢复时间。';
  }

  return '继续保持目前的训练节奏，循序渐进地增加强度，你的身体会越来越棒！';
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
          const workoutCount = dayRecords.length;

          result.push({
            day: weekDays[date.getDay()],
            duration,
            date: dateStr,
            workoutCount,
          });
        }

        return result;
      },

      getFavoriteCategory: (memberId) => {
        const records = get().records.filter((r) => r.memberId === memberId);
        if (records.length === 0) return null;

        const categoryCount: Record<string, number> = {};
        records.forEach((r) => {
          categoryCount[r.courseCategory] = (categoryCount[r.courseCategory] || 0) + 1;
        });

        let maxCategory: CourseCategory | null = null;
        let maxCount = 0;
        Object.entries(categoryCount).forEach(([cat, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxCategory = cat as CourseCategory;
          }
        });

        return maxCategory;
      },

      getWeeklyReport: (memberId, memberName) => {
        const records = get().records.filter((r) => r.memberId === memberId);
        const weeklyStats = get().getWeeklyStats(memberId);
        const stats = get().getMemberStats(memberId);
        const favoriteCategory = get().getFavoriteCategory(memberId);

        const weekRecords = records.filter((r) => {
          const recordDate = new Date(r.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return recordDate >= weekAgo;
        });

        const totalWorkouts = weekRecords.length;
        const totalDuration = weekRecords.reduce((sum, r) => sum + r.duration, 0);
        const totalCalories = weekRecords.reduce((sum, r) => sum + r.calories, 0);
        const avgCompletionRate = weekRecords.length > 0
          ? Math.round(weekRecords.reduce((sum, r) => sum + r.completionRate, 0) / weekRecords.length)
          : 0;

        const categoryBreakdown: { category: CourseCategory; count: number; duration: number }[] = [];
        const categoryMap: Record<string, { count: number; duration: number }> = {};
        weekRecords.forEach((r) => {
          if (!categoryMap[r.courseCategory]) {
            categoryMap[r.courseCategory] = { count: 0, duration: 0 };
          }
          categoryMap[r.courseCategory].count++;
          categoryMap[r.courseCategory].duration += r.duration;
        });
        Object.entries(categoryMap).forEach(([category, data]) => {
          categoryBreakdown.push({
            category: category as CourseCategory,
            count: data.count,
            duration: data.duration,
          });
        });
        categoryBreakdown.sort((a, b) => b.count - a.count);

        const prevWeekRecords = records.filter((r) => {
          const recordDate = new Date(r.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          return recordDate >= twoWeeksAgo && recordDate < weekAgo;
        });

        const prevDuration = prevWeekRecords.reduce((sum, r) => sum + r.duration, 0);
        const prevCompletionRate = prevWeekRecords.length > 0
          ? Math.round(prevWeekRecords.reduce((sum, r) => sum + r.completionRate, 0) / prevWeekRecords.length)
          : 0;

        const durationChange = prevDuration > 0
          ? Math.round(((totalDuration - prevDuration) / prevDuration) * 100)
          : totalDuration > 0 ? 100 : 0;

        const completionRateChange = prevCompletionRate > 0
          ? avgCompletionRate - prevCompletionRate
          : 0;

        const advice = generateAdvice(
          totalWorkouts,
          avgCompletionRate,
          favoriteCategory,
          stats.streakDays
        );

        return {
          memberId,
          memberName,
          totalWorkouts,
          totalDuration,
          totalCalories,
          avgCompletionRate,
          favoriteCategory,
          categoryBreakdown,
          dailyStats: weeklyStats,
          streakDays: stats.streakDays,
          advice,
          improvement: {
            durationChange,
            completionRateChange,
          },
        };
      },
    }),
    {
      name: 'history-storage',
    }
  )
);
