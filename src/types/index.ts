export type CourseCategory = 'stretch' | 'fatburn' | 'strength' | 'neck';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DurationFilter = 'all' | 'short' | 'medium' | 'long';

export type ExercisePhase = 'warmup' | 'main' | 'rest' | 'cooldown';

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  image: string;
  tips?: string[];
  phase?: ExercisePhase;
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
  warmupDuration?: number;
  cooldownDuration?: number;
  restBetweenExercises?: number;
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
  workoutCount: number;
}

export interface WeeklyReport {
  memberId: string;
  memberName: string;
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgCompletionRate: number;
  favoriteCategory: CourseCategory | null;
  categoryBreakdown: { category: CourseCategory; count: number; duration: number }[];
  dailyStats: WeeklyStat[];
  streakDays: number;
  advice: string;
  improvement: {
    durationChange: number;
    completionRateChange: number;
  };
}
