import { create } from 'zustand';
import { Exercise, Course, WorkoutRecord } from '@/types';

interface WorkoutState {
  course: Course | null;
  exercises: Exercise[];
  currentExerciseIndex: number;
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  totalCompletedExercises: number;
  startWorkout: (course: Course) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  skipExercise: () => void;
  tick: () => void;
  resetWorkout: () => void;
  completeWorkout: () => WorkoutRecord | null;
  getCurrentExercise: () => Exercise | null;
  getTotalDuration: () => number;
  getCompletedDuration: () => number;
  getNextExercise: () => Exercise | null;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  course: null,
  exercises: [],
  currentExerciseIndex: 0,
  currentTime: 0,
  isPlaying: false,
  isPaused: false,
  isCompleted: false,
  totalCompletedExercises: 0,

  startWorkout: (course) => {
    set({
      course,
      exercises: course.exercises,
      currentExerciseIndex: 0,
      currentTime: 0,
      isPlaying: true,
      isPaused: false,
      isCompleted: false,
      totalCompletedExercises: 0,
    });
  },

  pauseWorkout: () => set({ isPlaying: false, isPaused: true }),

  resumeWorkout: () => set({ isPlaying: true, isPaused: false }),

  nextExercise: () => {
    const { currentExerciseIndex, exercises, totalCompletedExercises } = get();
    if (currentExerciseIndex < exercises.length - 1) {
      set({
        currentExerciseIndex: currentExerciseIndex + 1,
        currentTime: 0,
        totalCompletedExercises: totalCompletedExercises + 1,
      });
    } else {
      set({
        isPlaying: false,
        isCompleted: true,
        totalCompletedExercises: totalCompletedExercises + 1,
      });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({
        currentExerciseIndex: currentExerciseIndex - 1,
        currentTime: 0,
      });
    }
  },

  skipExercise: () => {
    get().nextExercise();
  },

  tick: () => {
    const { isPlaying, currentTime, exercises, currentExerciseIndex } = get();
    if (!isPlaying) return;

    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const newTime = currentTime + 1;
    if (newTime >= currentExercise.duration) {
      get().nextExercise();
    } else {
      set({ currentTime: newTime });
    }
  },

  resetWorkout: () => {
    set({
      course: null,
      exercises: [],
      currentExerciseIndex: 0,
      currentTime: 0,
      isPlaying: false,
      isPaused: false,
      isCompleted: false,
      totalCompletedExercises: 0,
    });
  },

  completeWorkout: () => {
    const { course, exercises, totalCompletedExercises } = get();
    if (!course) return null;

    const completedDuration = exercises
      .slice(0, totalCompletedExercises)
      .reduce((sum, ex) => sum + ex.duration, 0);

    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const completionRate = Math.round((totalCompletedExercises / exercises.length) * 100);
    const calories = Math.round((completedDuration / totalDuration) * course.calories);

    const record: WorkoutRecord = {
      id: `r_${Date.now()}`,
      memberId: '',
      courseId: course.id,
      courseTitle: course.title,
      courseCategory: course.category,
      date: new Date().toISOString().split('T')[0],
      duration: Math.round(completedDuration / 60),
      completionRate,
      calories,
      totalExercises: exercises.length,
      completedExercises: totalCompletedExercises,
    };

    return record;
  },

  getCurrentExercise: () => {
    const { exercises, currentExerciseIndex } = get();
    return exercises[currentExerciseIndex] || null;
  },

  getTotalDuration: () => {
    return get().exercises.reduce((sum, ex) => sum + ex.duration, 0);
  },

  getCompletedDuration: () => {
    const { exercises, currentExerciseIndex, currentTime } = get();
    const completed = exercises
      .slice(0, currentExerciseIndex)
      .reduce((sum, ex) => sum + ex.duration, 0);
    return completed + currentTime;
  },

  getNextExercise: () => {
    const { exercises, currentExerciseIndex } = get();
    return exercises[currentExerciseIndex + 1] || null;
  },
}));
