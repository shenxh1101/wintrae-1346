export type CourseCategory = 'stretch' | 'fatburn' | 'strength' | 'neck';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DurationFilter = 'all' | 'short' | 'medium' | 'long';

export type ExercisePhase = 'warmup' | 'main' | 'rest' | 'cooldown';

export type WorkoutMode = 'normal' | 'skip-warmup' | 'main-only';

export type ReportRange = 'week' | 'last-week' | 'month';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlanStatus = 'pending' | 'completed-on-time' | 'completed-makeup' | 'skipped' | 'missed';

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
  workoutMode?: WorkoutMode;
  isFullCompletion: boolean;
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

export interface PlanScheduleItem {
  id: string;
  date: string;
  dayOfWeek: DayOfWeek;
  status: PlanStatus;
  completedDate?: string;
  reminderTime?: string;
}

export interface PlanItem {
  id: string;
  memberId: string;
  courseId: string;
  courseTitle: string;
  courseCover: string;
  weekStart: string;
  schedule: PlanScheduleItem[];
}

export interface PlanReviewItem {
  planId: string;
  courseId: string;
  courseTitle: string;
  courseCover: string;
  scheduled: number;
  completedOnTime: number;
  completedMakeup: number;
  skipped: number;
  missed: number;
}

export interface WeeklyReport {
  memberId: string;
  memberName: string;
  range: ReportRange;
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgCompletionRate: number;
  favoriteCategory: CourseCategory | null;
  categoryBreakdown: { category: CourseCategory; count: number; duration: number }[];
  dailyStats: WeeklyStat[];
  streakDays: number;
  advice: string;
  detailedAdvice: string[];
  improvement: {
    durationChange: number;
    completionRateChange: number;
    workoutCountChange: number;
  };
  planReview: PlanReviewItem[];
}

export interface FamilyPlan {
  weekStart: string;
  plans: PlanItem[];
}
