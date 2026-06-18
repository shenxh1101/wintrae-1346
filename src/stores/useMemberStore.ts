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
        const { currentMemberId, members } = get();
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
    }),
    {
      name: 'member-storage',
    }
  )
);
