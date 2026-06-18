import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, CourseCategory, Difficulty, DurationFilter } from '@/types';
import { mockCourses } from '@/data/mockData';

interface CourseState {
  courses: Course[];
  selectedCategory: CourseCategory | 'all';
  selectedDifficulty: Difficulty | 'all';
  selectedDuration: DurationFilter;
  setCategory: (category: CourseCategory | 'all') => void;
  setDifficulty: (difficulty: Difficulty | 'all') => void;
  setDuration: (duration: DurationFilter) => void;
  getCourseById: (id: string) => Course | undefined;
  getFilteredCourses: () => Course[];
  getRecommendedCourses: () => Course[];
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      selectedCategory: 'all',
      selectedDifficulty: 'all',
      selectedDuration: 'all',

      setCategory: (category) => set({ selectedCategory: category }),
      setDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
      setDuration: (duration) => set({ selectedDuration: duration }),

      getCourseById: (id) => {
        return get().courses.find((course) => course.id === id);
      },

      getFilteredCourses: () => {
        const { courses, selectedCategory, selectedDifficulty, selectedDuration } = get();
        return courses.filter((course) => {
          if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
          if (selectedDifficulty !== 'all' && course.difficulty !== selectedDifficulty) return false;
          if (selectedDuration !== 'all') {
            switch (selectedDuration) {
              case 'short':
                if (course.duration > 10) return false;
                break;
              case 'medium':
                if (course.duration <= 10 || course.duration > 20) return false;
                break;
              case 'long':
                if (course.duration <= 20) return false;
                break;
            }
          }
          return true;
        });
      },

      getRecommendedCourses: () => {
        const { courses } = get();
        return courses.slice(0, 4);
      },
    }),
    {
      name: 'course-storage',
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        selectedDifficulty: state.selectedDifficulty,
        selectedDuration: state.selectedDuration,
      }),
    }
  )
);
