import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FamilyMember } from '@/types';
import { mockMembers } from '@/data/mockData';

interface MemberState {
  members: FamilyMember[];
  currentMemberId: string;
  childMode: boolean;
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  switchMember: (id: string) => void;
  getCurrentMember: () => FamilyMember | undefined;
  toggleFavorite: (courseId: string) => void;
  isFavorite: (courseId: string) => boolean;
  toggleChildMode: () => void;
  recordWorkout: (memberId: string) => void;
  calculateStreak: (memberId: string) => number;
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      currentMemberId: mockMembers[0].id,
      childMode: false,

      addMember: (member) =>
        set((state) => ({
          members: [
            ...state.members,
            { ...member, id: `m_${Date.now()}`, favorites: [], streakDays: 0 },
          ],
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      switchMember: (id) => {
        const member = get().members.find((m) => m.id === id);
        set({
          currentMemberId: id,
          childMode: member?.isChild || false,
        });
      },

      getCurrentMember: () => {
        const { members, currentMemberId } = get();
        return members.find((m) => m.id === currentMemberId);
      },

      toggleFavorite: (courseId) => {
        const { currentMemberId } = get();
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== currentMemberId) return m;
            const isFav = m.favorites.includes(courseId);
            return {
              ...m,
              favorites: isFav
                ? m.favorites.filter((id) => id !== courseId)
                : [...m.favorites, courseId],
            };
          }),
        }));
      },

      isFavorite: (courseId) => {
        const member = get().getCurrentMember();
        return member?.favorites.includes(courseId) || false;
      },

      toggleChildMode: () =>
        set((state) => ({ childMode: !state.childMode })),

      recordWorkout: (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const member = get().members.find((m) => m.id === memberId);
        if (!member) return;

        const newStreak = member.lastWorkoutDate === today
          ? member.streakDays
          : get().calculateStreak(memberId) + 1;

        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  lastWorkoutDate: today,
                  streakDays: newStreak,
                }
              : m
          ),
        }));
      },

      calculateStreak: (memberId) => {
        const member = get().members.find((m) => m.id === memberId);
        if (!member) return 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let checkDate = new Date(today);
        
        const hasWorkoutOnDate = (dateStr: string) => {
          return member.lastWorkoutDate === dateStr;
        };

        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (hasWorkoutOnDate(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (i === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'member-storage',
    }
  )
);
