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
  savedRecord: WorkoutRecord | null;
  startWorkout: (course: Course) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  skipExercise: () => void;
  tick: () => void;
  resetWorkout: () => void;
  completeWorkout: () => WorkoutRecord | null;
  saveAndGetRecord: () => WorkoutRecord | null;
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
  savedRecord: null,

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
      savedRecord: null,
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
    const { currentExerciseIndex, totalCompletedExercises } = get();
    if (currentExerciseIndex > 0) {
      set({
        currentExerciseIndex: currentExerciseIndex - 1,
        currentTime: 0,
        totalCompletedExercises: Math.max(0, totalCompletedExercises - 1),
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
      savedRecord: null,
    });
  },

  completeWorkout: () => {
    const { course, exercises, totalCompletedExercises, currentExerciseIndex, currentTime } = get();
    if (!course) return null;

    const completedExerciseDuration = exercises
      .slice(0, totalCompletedExercises)
      .reduce((sum, ex) => sum + ex.duration, 0);

    const currentProgress = currentTime > 0 && currentExerciseIndex < exercises.length
      ? Math.min(currentTime, exercises[currentExerciseIndex].duration)
      : 0;

    const totalCompletedSeconds = completedExerciseDuration + currentProgress;
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const completionRate = Math.round((totalCompletedSeconds / totalDuration) * 100);
    const calories = Math.round((totalCompletedSeconds / totalDuration) * course.calories);

    const actualCompletedExercises = totalCompletedExercises > 0
      ? totalCompletedExercises
      : (currentTime > 0 ? 1 : 0);

    const record: WorkoutRecord = {
      id: `r_${Date.now()}`,
      memberId: '',
      courseId: course.id,
      courseTitle: course.title,
      courseCategory: course.category,
      date: new Date().toISOString().split('T')[0],
      duration: Math.max(1, Math.round(totalCompletedSeconds / 60)),
      completionRate,
      calories,
      totalExercises: exercises.length,
      completedExercises: actualCompletedExercises,
    };

    return record;
  },

  saveAndGetRecord: () => {
    const { savedRecord } = get();
    if (savedRecord) return savedRecord;

    const record = get().completeWorkout();
    if (record) {
      set({ savedRecord: record });
      return record;
    }
    return null;
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
