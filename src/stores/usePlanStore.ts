import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlanItem, FamilyPlan } from '@/types';

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

interface PlanState {
  plans: PlanItem[];
  addPlan: (plan: Omit<PlanItem, 'id' | 'completedCount' | 'weekStart'>) => void;
  removePlan: (planId: string) => void;
  updatePlan: (planId: string, updates: Partial<PlanItem>) => void;
  getMemberPlans: (memberId: string) => PlanItem[];
  getThisWeekPlans: (memberId: string) => PlanItem[];
  incrementCompleted: (memberId: string, courseId: string) => void;
  getWeeklyProgress: (memberId: string) => { total: number; completed: number; percentage: number };
}

function createMockPlans(): PlanItem[] {
  const weekStart = getWeekStart();
  return [
    {
      id: 'p1',
      memberId: 'm1',
      courseId: 'c1',
      courseTitle: '晨间唤醒拉伸',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      targetCount: 5,
      completedCount: 3,
      reminderTime: '08:00',
      weekStart,
    },
    {
      id: 'p2',
      memberId: 'm1',
      courseId: 'c6',
      courseTitle: '脂肪杀手训练',
      courseCover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
      targetCount: 3,
      completedCount: 2,
      reminderTime: '19:00',
      weekStart,
    },
    {
      id: 'p3',
      memberId: 'm2',
      courseId: 'c5',
      courseTitle: '睡前放松拉伸',
      courseCover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop',
      targetCount: 4,
      completedCount: 2,
      reminderTime: '21:30',
      weekStart,
    },
    {
      id: 'p4',
      memberId: 'm3',
      courseId: 'c1',
      courseTitle: '晨间唤醒拉伸',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      targetCount: 3,
      completedCount: 1,
      reminderTime: '07:30',
      weekStart,
    },
    {
      id: 'p5',
      memberId: 'm3',
      courseId: 'c4',
      courseTitle: '肩颈放松舒缓',
      courseCover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
      targetCount: 4,
      completedCount: 2,
      reminderTime: '16:00',
      weekStart,
    },
  ];
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: createMockPlans(),

      addPlan: (plan) => {
        const weekStart = getWeekStart();
        const newPlan: PlanItem = {
          ...plan,
          id: `p_${Date.now()}`,
          completedCount: 0,
          weekStart,
        };
        set((state) => ({
          plans: [...state.plans, newPlan],
        }));
      },

      removePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
        })),

      updatePlan: (planId, updates) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, ...updates } : p
          ),
        })),

      getMemberPlans: (memberId) => {
        const weekStart = getWeekStart();
        return get().plans.filter(
          (p) => p.memberId === memberId && p.weekStart === weekStart
        );
      },

      getThisWeekPlans: (memberId) => {
        return get().getMemberPlans(memberId);
      },

      incrementCompleted: (memberId, courseId) => {
        const weekStart = getWeekStart();
        set((state) => ({
          plans: state.plans.map((p) => {
            if (
              p.memberId === memberId &&
              p.courseId === courseId &&
              p.weekStart === weekStart
            ) {
              return {
                ...p,
                completedCount: Math.min(p.completedCount + 1, p.targetCount),
              };
            }
            return p;
          }),
        }));
      },

      getWeeklyProgress: (memberId) => {
        const plans = get().getThisWeekPlans(memberId);
        const total = plans.reduce((sum, p) => sum + p.targetCount, 0);
        const completed = plans.reduce((sum, p) => sum + p.completedCount, 0);
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
      },
    }),
    {
      name: 'plan-storage',
    }
  )
);
