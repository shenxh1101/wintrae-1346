import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlanItem, PlanScheduleItem, PlanStatus, DayOfWeek, PlanReviewItem } from '@/types';

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

function getDateOfWeek(weekStart: string, dayOfWeek: DayOfWeek): string {
  const base = new Date(weekStart);
  const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const date = new Date(base);
  date.setDate(base.getDate() + dayOffset);
  return date.toISOString().split('T')[0];
}

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getTodayDayOfWeek(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

interface AddPlanInput {
  memberId: string;
  courseId: string;
  courseTitle: string;
  courseCover: string;
  daysOfWeek: DayOfWeek[];
  reminderTime?: string;
}

interface PlanState {
  plans: PlanItem[];
  addPlan: (plan: AddPlanInput) => void;
  removePlan: (planId: string) => void;
  markCompleted: (memberId: string, courseId: string, date?: string) => void;
  markSkipped: (scheduleItemId: string) => void;
  markMakeup: (scheduleItemId: string, makeupDate: string) => void;
  getMemberPlans: (memberId: string) => PlanItem[];
  getThisWeekPlans: (memberId: string) => PlanItem[];
  getTodayPlans: (memberId: string) => { plan: PlanItem; schedule: PlanScheduleItem }[];
  getWeeklySchedule: (memberId: string) => { date: string; dayOfWeek: DayOfWeek; items: { plan: PlanItem; schedule: PlanScheduleItem }[] }[];
  getWeeklyProgress: (memberId: string) => { total: number; completed: number; percentage: number; skipped: number; missed: number };
  getPlanReview: (memberId: string, weekStart?: string) => PlanReviewItem[];
}

function createMockPlans(): PlanItem[] {
  const weekStart = getWeekStart();
  const today = getTodayStr();
  const todayDow = getTodayDayOfWeek();

  function createSchedule(days: DayOfWeek[], defaultStatus: PlanStatus = 'pending'): PlanScheduleItem[] {
    return days.map((d, idx) => {
      const date = getDateOfWeek(weekStart, d);
      let status: PlanStatus = defaultStatus;
      if (date < today) status = 'missed';
      if (date === today && todayDow > d) status = 'missed';
      if (idx % 3 === 0 && date <= today) status = 'completed-on-time';
      if (idx % 4 === 1 && date < today) status = 'completed-makeup';
      return {
        id: `s_${Date.now()}_${idx}_${d}`,
        date,
        dayOfWeek: d,
        status,
        completedDate: status.startsWith('completed') ? date : undefined,
        reminderTime: d === 1 ? '08:00' : d === 3 ? '19:00' : d === 5 ? '16:00' : undefined,
      };
    });
  }

  return [
    {
      id: 'p1',
      memberId: 'm1',
      courseId: 'c1',
      courseTitle: '晨间唤醒拉伸',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      weekStart,
      schedule: createSchedule([1, 2, 3, 4, 5] as DayOfWeek[]),
    },
    {
      id: 'p2',
      memberId: 'm1',
      courseId: 'c6',
      courseTitle: '脂肪杀手训练',
      courseCover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
      weekStart,
      schedule: createSchedule([2, 4, 6] as DayOfWeek[]),
    },
    {
      id: 'p3',
      memberId: 'm2',
      courseId: 'c5',
      courseTitle: '睡前放松拉伸',
      courseCover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop',
      weekStart,
      schedule: createSchedule([1, 3, 5, 6] as DayOfWeek[]),
    },
    {
      id: 'p4',
      memberId: 'm3',
      courseId: 'c1',
      courseTitle: '晨间唤醒拉伸',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      weekStart,
      schedule: createSchedule([1, 3, 5] as DayOfWeek[]),
    },
    {
      id: 'p5',
      memberId: 'm3',
      courseId: 'c4',
      courseTitle: '肩颈放松舒缓',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      weekStart,
      schedule: createSchedule([2, 4, 6, 0] as DayOfWeek[]),
    },
  ];
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: createMockPlans(),

      addPlan: (input) => {
        const weekStart = getWeekStart();
        const schedule: PlanScheduleItem[] = input.daysOfWeek.map((d) => ({
          id: `s_${Date.now()}_${d}_${Math.random().toString(36).slice(2, 7)}`,
          date: getDateOfWeek(weekStart, d),
          dayOfWeek: d,
          status: 'pending',
          reminderTime: input.reminderTime,
        }));

        const newPlan: PlanItem = {
          id: `p_${Date.now()}`,
          memberId: input.memberId,
          courseId: input.courseId,
          courseTitle: input.courseTitle,
          courseCover: input.courseCover,
          weekStart,
          schedule,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
      },

      removePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
        })),

      markCompleted: (memberId, courseId, date) => {
        const targetDate = date || getTodayStr();
        const weekStart = getWeekStart();

        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.memberId !== memberId || p.courseId !== courseId || p.weekStart !== weekStart) return p;

            let foundMatching = false;
            const newSchedule = p.schedule.map((s) => {
              if (foundMatching) return s;
              if (s.status === 'completed-on-time' || s.status === 'completed-makeup') return s;

              if (s.date === targetDate) {
                foundMatching = true;
                return { ...s, status: 'completed-on-time' as PlanStatus, completedDate: targetDate };
              }
              return s;
            });

            if (!foundMatching) {
              let earliestMissed: PlanScheduleItem | null = null;
              for (const s of newSchedule) {
                if (s.status === 'missed' || s.status === 'pending') {
                  if (!earliestMissed || s.date < earliestMissed.date) {
                    earliestMissed = s;
                  }
                }
              }
              if (earliestMissed) {
                const idx = newSchedule.findIndex((x) => x.id === earliestMissed!.id);
                if (idx !== -1) {
                  newSchedule[idx] = {
                    ...newSchedule[idx],
                    status: 'completed-makeup' as PlanStatus,
                    completedDate: targetDate,
                  };
                }
              }
            }

            return { ...p, schedule: newSchedule };
          }),
        }));
      },

      markSkipped: (scheduleItemId) => {
        set((state) => ({
          plans: state.plans.map((p) => ({
            ...p,
            schedule: p.schedule.map((s) =>
              s.id === scheduleItemId ? { ...s, status: 'skipped' as PlanStatus } : s
            ),
          })),
        }));
      },

      markMakeup: (scheduleItemId, makeupDate) => {
        set((state) => ({
          plans: state.plans.map((p) => ({
            ...p,
            schedule: p.schedule.map((s) =>
              s.id === scheduleItemId
                ? { ...s, status: 'completed-makeup' as PlanStatus, completedDate: makeupDate }
                : s
            ),
          })),
        }));
      },

      getMemberPlans: (memberId) => {
        const weekStart = getWeekStart();
        return get().plans.filter((p) => p.memberId === memberId && p.weekStart === weekStart);
      },

      getThisWeekPlans: (memberId) => get().getMemberPlans(memberId),

      getTodayPlans: (memberId) => {
        const today = getTodayStr();
        const plans = get().getThisWeekPlans(memberId);
        const result: { plan: PlanItem; schedule: PlanScheduleItem }[] = [];
        for (const plan of plans) {
          for (const s of plan.schedule) {
            if (s.date === today) {
              result.push({ plan, schedule: s });
            }
          }
        }
        return result.sort((a, b) => (a.schedule.reminderTime || '').localeCompare(b.schedule.reminderTime || ''));
      },

      getWeeklySchedule: (memberId) => {
        const weekStart = getWeekStart();
        const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
        const plans = get().getThisWeekPlans(memberId);

        return days.map((d) => {
          const date = getDateOfWeek(weekStart, d);
          const items: { plan: PlanItem; schedule: PlanScheduleItem }[] = [];
          for (const plan of plans) {
            for (const s of plan.schedule) {
              if (s.date === date) {
                items.push({ plan, schedule: s });
              }
            }
          }
          items.sort((a, b) => (a.schedule.reminderTime || '').localeCompare(b.schedule.reminderTime || ''));
          return { date, dayOfWeek: d, items };
        });
      },

      getWeeklyProgress: (memberId) => {
        const plans = get().getThisWeekPlans(memberId);
        let total = 0;
        let completed = 0;
        let skipped = 0;
        let missed = 0;
        for (const plan of plans) {
          for (const s of plan.schedule) {
            total++;
            if (s.status === 'completed-on-time' || s.status === 'completed-makeup') completed++;
            else if (s.status === 'skipped') skipped++;
            else if (s.status === 'missed') missed++;
          }
        }
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage, skipped, missed };
      },

      getPlanReview: (memberId, ws) => {
        const weekStart = ws || getWeekStart();
        const plans = get().plans.filter((p) => p.memberId === memberId && p.weekStart === weekStart);
        const result: PlanReviewItem[] = [];

        for (const plan of plans) {
          const review: PlanReviewItem = {
            planId: plan.id,
            courseId: plan.courseId,
            courseTitle: plan.courseTitle,
            courseCover: plan.courseCover,
            scheduled: plan.schedule.length,
            completedOnTime: 0,
            completedMakeup: 0,
            skipped: 0,
            missed: 0,
          };
          for (const s of plan.schedule) {
            if (s.status === 'completed-on-time') review.completedOnTime++;
            else if (s.status === 'completed-makeup') review.completedMakeup++;
            else if (s.status === 'skipped') review.skipped++;
            else if (s.status === 'missed') review.missed++;
          }
          result.push(review);
        }
        return result;
      },
    }),
    { name: 'plan-storage' }
  )
);
