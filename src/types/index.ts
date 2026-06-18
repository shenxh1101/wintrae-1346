export type CourseCategory = 'stretch' | 'fatburn' | 'strength' | 'neck';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DurationFilter = 'all' | 'short' | 'medium' | 'long';

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  image: string;
  tips?: string[];
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  difficulty: Difficulty;
  duration: number;
  calories: number;
  cover: string;
  description: string;
  tips: string[];
  suitableFor: string[];
  exercises: Exercise[];
  isForChildren?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  isChild: boolean;
  goal: string;
  restReminder: number;
  streakDays: number;
  favorites: string[];
  lastWorkoutDate?: string;
}

export interface WorkoutRecord {
  id: string;
  memberId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: CourseCategory;
  date: string;
  duration: number;
  completionRate: number;
  calories: number;
  totalExercises: number;
  completedExercises: number;
}

export interface WorkoutState {
  isPlaying: boolean;
  currentExerciseIndex: number;
  currentTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  totalCompletedExercises: number;
}

export interface WeeklyStat {
  day: string;
  duration: number;
  date: string;
}
