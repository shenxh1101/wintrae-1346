import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutRecord, WeeklyStat, WeeklyReport, CourseCategory, ReportRange, PlanReviewItem } from '@/types';
import { mockRecords } from '@/data/mockData';
import { usePlanStore } from './usePlanStore';
import { useMemberStore } from './useMemberStore';

interface HistoryState {
  records: WorkoutRecord[];
  addRecord: (record: WorkoutRecord) => void;
  getMemberRecords: (memberId: string, forChildren?: boolean) => WorkoutRecord[];
  getMemberStats: (memberId: string) => {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    avgCompletionRate: number;
    streakDays: number;
  };
  getWeeklyStats: (memberId: string, range?: ReportRange) => WeeklyStat[];
  getWeeklyReport: (memberId: string, memberName: string, range?: ReportRange, forChildren?: boolean) => WeeklyReport;
  getFavoriteCategory: (memberId: string, range?: ReportRange) => CourseCategory | null;
  calculateStreakDays: (memberId: string) => number;
}

function getCategoryAdvice(category: CourseCategory | null, isChild: boolean): string[] {
  if (isChild) {
    return [
      '小朋友运动时要注意安全，动作幅度不要太大',
      '每次运动时间控制在15-20分钟，避免过度疲劳',
      '可以和爸爸妈妈一起练，增加互动乐趣',
      '运动后记得喝水和拉伸哦',
    ];
  }

  switch (category) {
    case 'stretch':
      return [
        '拉伸训练有助于身体柔韧性，建议在早晨或睡前进行',
        '可以搭配轻度力量训练，提升整体身体素质',
        '每个动作保持20-30秒，不要弹震式拉伸',
        '注意呼吸配合，动作缓慢而有控制',
      ];
    case 'neck':
      return [
        '肩颈放松对上班族很重要，建议每工作1小时起来活动一下',
        '动作要轻柔，避免用力过猛造成伤害',
        '平时注意坐姿，避免长时间低头看手机',
        '可以配合热敷效果更好',
      ];
    case 'fatburn':
      return [
        '燃脂训练效果不错！建议每周3-5次，配合饮食控制',
        '运动前做好热身，避免运动损伤',
        '运动后30分钟内补充蛋白质，帮助恢复',
        '注意循序渐进，不要一开始就追求高强度',
      ];
    case 'strength':
      return [
        '力量训练很有规律！建议不同肌群交替训练，给肌肉恢复时间',
        '动作质量比数量更重要，注意姿势标准',
        '逐渐增加重量，持续给肌肉新的刺激',
        '保证充足睡眠，肌肉是在休息时生长的',
      ];
    default:
      return [
        '保持规律的运动习惯，循序渐进',
        '训练前热身，训练后拉伸放松',
        '注意补充水分和营养',
        '倾听身体的声音，适度休息',
      ];
  }
}

function generateDetailedAdvice(
  totalWorkouts: number,
  avgCompletionRate: number,
  favoriteCategory: CourseCategory | null,
  streakDays: number,
  planReview: PlanReviewItem[],
  isChild: boolean
): string[] {
  const advice: string[] = [];

  if (isChild) {
    advice.push('坚持运动很棒！记得不要太累哦～');
  }

  if (totalWorkouts === 0) {
    advice.push('开启你的第一次训练吧！哪怕只有5分钟，也是好的开始。');
    return advice;
  }

  if (totalWorkouts < 3 && !isChild) {
    advice.push('训练频率可以再提高一些，建议每周至少运动3-4次，循序渐进养成习惯。');
  }

  if (totalWorkouts >= 5 && !isChild) {
    advice.push('你本周训练很勤奋！注意劳逸结合，给身体适当的恢复时间。');
  }

  if (avgCompletionRate < 60) {
    advice.push('可以先选择难度低一些的课程，保证完成质量比追求强度更重要。');
  }

  if (avgCompletionRate >= 90) {
    advice.push('完成率很高！训练习惯很好，可以考虑适当提升难度。');
  }

  if (streakDays >= 14) {
    advice.push(`太棒了！已经连续坚持${streakDays}天了，你已经养成了运动习惯，继续保持！`);
  } else if (streakDays >= 7) {
    advice.push(`连续坚持${streakDays}天了，再坚持一周就能形成稳定习惯！`);
  }

  if (planReview.length > 0) {
    const totalScheduled = planReview.reduce((s, p) => s + p.scheduled, 0);
    const totalCompleted = planReview.reduce((s, p) => s + p.completedOnTime + p.completedMakeup, 0);
    const totalMissed = planReview.reduce((s, p) => s + p.missed, 0);

    if (totalMissed > 0 && !isChild) {
      advice.push(`本周有${totalMissed}次计划未完成，分析一下原因，下次把计划安排得更合理一些。`);
    }

    if (totalCompleted >= totalScheduled && totalScheduled > 0) {
      advice.push('计划执行得很好！全部按时或补练完成，自律的你最棒！');
    }
  }

  advice.push(...getCategoryAdvice(favoriteCategory, isChild).slice(0, 2));

  return advice.slice(0, 5);
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

function getDateRange(range: ReportRange): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  if (range === 'week') {
    start.setDate(start.getDate() - 6);
    prevStart.setDate(prevStart.getDate() - 13);
    prevEnd.setDate(prevEnd.getDate() - 7);
  } else if (range === 'last-week') {
    start.setDate(start.getDate() - 13);
    end.setDate(end.getDate() - 7);
    prevStart.setDate(prevStart.getDate() - 20);
    prevEnd.setDate(prevEnd.getDate() - 14);
  } else if (range === 'month') {
    start.setDate(start.getDate() - 29);
    prevStart.setDate(prevStart.getDate() - 59);
    prevEnd.setDate(prevEnd.getDate() - 30);
  }

  start.setHours(0, 0, 0, 0);
  prevStart.setHours(0, 0, 0, 0);
  prevEnd.setHours(23, 59, 59, 999);

  return { start, end, prevStart, prevEnd };
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: mockRecords,

      addRecord: (record) => {
        set((state) => ({
          records: [record, ...state.records],
        }));

        if (record.memberId && record.isFullCompletion) {
          const { markCompleted } = usePlanStore.getState();
          markCompleted(record.memberId, record.courseId, record.date);

          const { recordWorkout } = useMemberStore.getState();
          recordWorkout(record.memberId);
        } else if (record.memberId) {
          const { recordWorkout } = useMemberStore.getState();
          recordWorkout(record.memberId);
        }
      },

      getMemberRecords: (memberId, forChildren = false) => {
        let records = get()
          .records.filter((r) => r.memberId === memberId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (forChildren) {
          records = records.filter((r) => r.courseCategory === 'stretch' || r.courseCategory === 'neck');
        }

        return records;
      },

      calculateStreakDays: (memberId) => {
        const records = get().records.filter((r) => r.memberId === memberId && r.isFullCompletion);
        if (records.length === 0) return 0;

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

        return streakDays;
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

        const streakDays = get().calculateStreakDays(memberId);

        return {
          totalWorkouts,
          totalDuration,
          totalCalories,
          avgCompletionRate,
          streakDays,
        };
      },

      getWeeklyStats: (memberId, range = 'week') => {
        const records = get().records.filter((r) => r.memberId === memberId);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const result: WeeklyStat[] = [];

        const { start } = getDateRange(range);
        const daysCount = range === 'month' ? 30 : 7;

        for (let i = daysCount - 1; i >= 0; i--) {
          const date = new Date(start);
          date.setDate(date.getDate() + (daysCount - 1 - i));
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

      getFavoriteCategory: (memberId, range) => {
        let records = get().records.filter((r) => r.memberId === memberId);

        if (range) {
          const { start, end } = getDateRange(range);
          records = records.filter((r) => {
            const recordDate = new Date(r.date);
            return recordDate >= start && recordDate <= end;
          });
        }

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

      getWeeklyReport: (memberId, memberName, range = 'week', forChildren = false) => {
        let records = get().records.filter((r) => r.memberId === memberId);

        if (forChildren) {
          records = records.filter((r) => r.courseCategory === 'stretch' || r.courseCategory === 'neck');
        }

        const { start, end, prevStart, prevEnd } = getDateRange(range);
        const weeklyStats = get().getWeeklyStats(memberId, range);
        const streakDays = get().calculateStreakDays(memberId);
        const favoriteCategory = get().getFavoriteCategory(memberId, range);

        const { getPlanReview } = usePlanStore.getState();
        const { members } = useMemberStore.getState();
        const member = members.find((m) => m.id === memberId);
        const isChild = forChildren || !!member?.isChild;

        let planReview: PlanReviewItem[] = [];
        if (range === 'week') {
          planReview = getPlanReview(memberId);
        } else if (range === 'last-week') {
          const lastWeekStart = new Date(getWeekStart());
          lastWeekStart.setDate(lastWeekStart.getDate() - 7);
          planReview = getPlanReview(memberId, lastWeekStart.toISOString().split('T')[0]);
        }

        if (isChild) {
          planReview = planReview.filter((p) => {
            const cat = records.find((r) => r.courseId === p.courseId)?.courseCategory;
            return cat === 'stretch' || cat === 'neck' || !cat;
          });
        }

        const periodRecords = records.filter((r) => {
          const recordDate = new Date(r.date);
          return recordDate >= start && recordDate <= end;
        });

        const prevPeriodRecords = records.filter((r) => {
          const recordDate = new Date(r.date);
          return recordDate >= prevStart && recordDate <= prevEnd;
        });

        const totalWorkouts = periodRecords.length;
        const totalDuration = periodRecords.reduce((sum, r) => sum + r.duration, 0);
        const totalCalories = periodRecords.reduce((sum, r) => sum + r.calories, 0);
        const avgCompletionRate = periodRecords.length > 0
          ? Math.round(periodRecords.reduce((sum, r) => sum + r.completionRate, 0) / periodRecords.length)
          : 0;

        const categoryBreakdown: { category: CourseCategory; count: number; duration: number }[] = [];
        const categoryMap: Record<string, { count: number; duration: number }> = {};
        periodRecords.forEach((r) => {
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

        const prevDuration = prevPeriodRecords.reduce((sum, r) => sum + r.duration, 0);
        const prevCompletionRate = prevPeriodRecords.length > 0
          ? Math.round(prevPeriodRecords.reduce((sum, r) => sum + r.completionRate, 0) / prevPeriodRecords.length)
          : 0;
        const prevWorkoutCount = prevPeriodRecords.length;

        const durationChange = prevDuration > 0
          ? Math.round(((totalDuration - prevDuration) / prevDuration) * 100)
          : totalDuration > 0 ? 100 : 0;

        const completionRateChange = prevCompletionRate > 0
          ? avgCompletionRate - prevCompletionRate
          : 0;

        const workoutCountChange = prevWorkoutCount > 0
          ? Math.round(((totalWorkouts - prevWorkoutCount) / prevWorkoutCount) * 100)
          : totalWorkouts > 0 ? 100 : 0;

        const advice = generateAdvice(
          totalWorkouts,
          avgCompletionRate,
          favoriteCategory,
          streakDays
        );

        const detailedAdvice = generateDetailedAdvice(
          totalWorkouts,
          avgCompletionRate,
          favoriteCategory,
          streakDays,
          planReview,
          isChild
        );

        return {
          memberId,
          memberName,
          range,
          totalWorkouts,
          totalDuration,
          totalCalories,
          avgCompletionRate,
          favoriteCategory,
          categoryBreakdown,
          dailyStats: weeklyStats,
          streakDays,
          advice,
          detailedAdvice,
          improvement: {
            durationChange,
            completionRateChange,
            workoutCountChange,
          },
          planReview,
        };
      },
    }),
    {
      name: 'history-storage',
    }
  )
);
