import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Star, Play, AlertTriangle, CheckCircle, Timer, Sun, Moon, Wind, Zap, ChevronRight } from 'lucide-react';
import { useCourseStore } from '@/stores/useCourseStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { cn, formatTime, getDifficultyName, getDifficultyColor, getCategoryName } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useState } from 'react';
import { ExercisePhase, WorkoutMode } from '@/types';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById } = useCourseStore();
  const { isFavorite, toggleFavorite, childMode } = useMemberStore();
  const { startWorkout } = useWorkoutStore();
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>('normal');

  const course = getCourseById(id || '');
  const favorite = course ? isFavorite(course.id) : false;

  useKeyboardNavigation({
    onBack: () => navigate('/'),
    onEnter: () => {
      if (course) {
        handleStartWorkout();
      }
    },
  });

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">课程不存在</h2>
          <Link to="/" className="tv-btn-primary inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (childMode && !course.isForChildren && course.difficulty !== 'easy') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👶</div>
          <h2 className="text-2xl font-bold text-white mb-4">儿童模式下不可查看此课程</h2>
          <p className="text-text-secondary mb-6">请切换到成人模式查看更多课程</p>
          <Link to="/" className="tv-btn-primary inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const selectedExercise = course.exercises[selectedExerciseIndex];

  const phaseInfo: Record<ExercisePhase, { label: string; icon: any; color: string; bgColor: string }> = {
    warmup: { label: '热身', icon: Sun, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
    main: { label: '训练', icon: Zap, color: 'text-vibrant-orange', bgColor: 'bg-vibrant-orange/20' },
    rest: { label: '休息', icon: Wind, color: 'text-mint-green', bgColor: 'bg-mint-green/20' },
    cooldown: { label: '放松', icon: Moon, color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  };

  const phaseStats = course.exercises.reduce((acc, ex) => {
    const phase = ex.phase || 'main';
    if (!acc[phase]) {
      acc[phase] = { count: 0, duration: 0 };
    }
    acc[phase].count++;
    acc[phase].duration += ex.duration;
    return acc;
  }, {} as Record<ExercisePhase, { count: number; duration: number }>);

  const totalSeconds = course.exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalMinutes = Math.ceil(totalSeconds / 60);

  const getModeDuration = (mode: WorkoutMode): number => {
    if (mode === 'normal') return totalSeconds;
    if (mode === 'skip-warmup') {
      return course.exercises.filter(e => e.phase !== 'warmup').reduce((sum, e) => sum + e.duration, 0);
    }
    if (mode === 'main-only') {
      return course.exercises.filter(e => e.phase === 'main').reduce((sum, e) => sum + e.duration, 0);
    }
    return totalSeconds;
  };

  const handleStartWorkout = () => {
    if (course) {
      startWorkout(course, workoutMode);
      navigate(`/workout/${course.id}`);
    }
  };

  const modeOptions = [
    { id: 'normal', label: '完整训练', desc: '包含热身、训练和放松', duration: totalSeconds },
    { id: 'skip-warmup', label: '跳过热身', desc: '直接进入主体训练', duration: getModeDuration('skip-warmup') },
    { id: 'main-only', label: '只练主体', desc: '仅核心训练动作', duration: getModeDuration('main-only') },
  ];

  const orderedPhases: ExercisePhase[] = ['warmup', 'main', 'rest', 'cooldown'];

  return (
    <div className="min-h-screen bg-gradient-dark pt-24 pb-16">
      <div className="container mx-auto px-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="focusable flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg">返回</span>
        </button>

        <div className="grid grid-cols-3 gap-8">
          {/* 左侧：课程封面和信息 */}
          <div className="col-span-2 space-y-8">
            {/* 课程封面 */}
            <div className="relative rounded-3xl overflow-hidden aspect-video animate-fade-in">
              <img
                src={course.cover}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent" />
              
              <div className="absolute top-6 left-6 flex gap-3">
                <span className="px-4 py-2 bg-vibrant-orange/90 text-white font-medium rounded-full">
                  {getCategoryName(course.category)}
                </span>
                <span className={cn('px-4 py-2 font-medium rounded-full', getDifficultyColor(course.difficulty))}>
                  {getDifficultyName(course.difficulty)}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                <div className="flex items-center gap-6 flex-wrap">
                  <span className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5 text-vibrant-orange" />
                    {totalMinutes} 分钟
                  </span>
                  <span className="flex items-center gap-2 text-white">
                    <Flame className="w-5 h-5 text-orange-400" />
                    约 {course.calories} 千卡
                  </span>
                  <span className="flex items-center gap-2 text-white">
                    <Timer className="w-5 h-5 text-mint-green" />
                    {course.exercises.length} 个动作
                  </span>
                </div>
              </div>
            </div>

            {/* 训练结构 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <h3 className="text-xl font-bold text-white mb-6">训练结构</h3>
              <div className="flex items-stretch gap-2 mb-6">
                {orderedPhases.map((phase) => {
                  const stats = phaseStats[phase];
                  if (!stats || stats.duration === 0) return null;
                  const info = phaseInfo[phase];
                  const Icon = info.icon;
                  const percentage = (stats.duration / totalSeconds) * 100;
                  
                  return (
                    <div
                      key={phase}
                      className="flex-1 flex flex-col items-center p-4 rounded-2xl bg-navy-medium/50"
                      style={{ flex: percentage }}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', info.bgColor)}>
                        <Icon className={cn('w-6 h-6', info.color)} />
                      </div>
                      <p className="font-medium text-white">{info.label}</p>
                      <p className="text-sm text-text-secondary mt-1">{formatTime(stats.duration)}</p>
                      <p className="text-xs text-text-muted mt-0.5">{stats.count} 个动作</p>
                    </div>
                  );
                })}
              </div>
              
              {/* 时间轴 */}
              <div className="relative h-2 bg-navy-medium rounded-full overflow-hidden mb-4">
                {orderedPhases.reduce((offset, phase) => {
                  const stats = phaseStats[phase];
                  if (!stats || stats.duration === 0) return offset;
                  const percentage = (stats.duration / totalSeconds) * 100;
                  return offset;
                }, 0)}
                {orderedPhases.map((phase, idx) => {
                  const stats = phaseStats[phase];
                  if (!stats || stats.duration === 0) return null;
                  const percentage = (stats.duration / totalSeconds) * 100;
                  const colors: Record<ExercisePhase, string> = {
                    warmup: 'from-yellow-400 to-yellow-500',
                    main: 'from-vibrant-orange to-orange-hover',
                    rest: 'from-mint-green to-teal-400',
                    cooldown: 'from-purple-500 to-purple-400',
                  };
                  const prevPercentage = orderedPhases
                    .slice(0, idx)
                    .reduce((sum, p) => sum + (phaseStats[p]?.duration || 0) / totalSeconds * 100, 0);
                  
                  return (
                    <div
                      key={phase}
                      className={cn('absolute top-0 bottom-0 bg-gradient-to-r', colors[phase])}
                      style={{
                        left: `${prevPercentage}%`,
                        width: `${percentage}%`,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>0 分钟</span>
                <span>{Math.ceil(totalSeconds / 60)} 分钟</span>
              </div>
            </div>

            {/* 动作预览 */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-white mb-4">动作预览</h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {course.exercises.map((exercise, index) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExerciseIndex(index)}
                    className={cn(
                      'focusable flex-shrink-0 w-48 rounded-2xl overflow-hidden transition-all duration-300',
                      selectedExerciseIndex === index
                        ? 'ring-2 ring-vibrant-orange scale-105 shadow-glow'
                        : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-deep-navy to-transparent p-3">
                        <p className="text-sm font-medium text-white line-clamp-1">{exercise.name}</p>
                        <p className="text-xs text-text-secondary">{exercise.duration}秒</p>
                      </div>
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-deep-navy/80 flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium', phaseInfo[exercise.phase || 'main'].bgColor, phaseInfo[exercise.phase || 'main'].color)}>
                        {phaseInfo[exercise.phase || 'main'].label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 选中的动作详情 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex gap-6">
                <div className="w-64 flex-shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={selectedExercise.image}
                    alt={selectedExercise.name}
                    className="w-full h-full object-cover aspect-video"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-2xl font-bold text-white">{selectedExercise.name}</h4>
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', phaseInfo[selectedExercise.phase || 'main'].bgColor, phaseInfo[selectedExercise.phase || 'main'].color)}>
                      {phaseInfo[selectedExercise.phase || 'main'].label}
                    </span>
                  </div>
                  <p className="text-lg text-vibrant-orange font-medium mb-4">
                    {selectedExercise.duration} 秒
                  </p>
                  <p className="text-text-secondary mb-4">{selectedExercise.description}</p>
                  {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">动作要点：</p>
                      {selectedExercise.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <CheckCircle className="w-4 h-4 text-mint-green flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：开始训练和注意事项 */}
          <div className="space-y-6">
            {/* 开始训练模式选择 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="text-lg font-bold text-white mb-4">选择训练模式</h3>
              <div className="space-y-3 mb-6">
                {modeOptions.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setWorkoutMode(mode.id as WorkoutMode)}
                    className={cn(
                      'focusable w-full p-4 rounded-xl text-left transition-all',
                      workoutMode === mode.id
                        ? 'bg-vibrant-orange/20 border-2 border-vibrant-orange'
                        : 'bg-navy-medium/50 border-2 border-transparent hover:bg-navy-medium'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'font-medium',
                        workoutMode === mode.id ? 'text-white' : 'text-text-secondary'
                      )}>
                        {mode.label}
                      </span>
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        workoutMode === mode.id ? 'text-vibrant-orange rotate-90' : 'text-text-muted'
                      )} />
                    </div>
                    <p className="text-sm text-text-muted mt-1">{mode.desc}</p>
                    <p className="text-sm text-vibrant-orange mt-2">
                      {formatTime(mode.duration)}
                    </p>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleStartWorkout}
                className="focusable w-full py-5 rounded-2xl bg-gradient-to-r from-vibrant-orange to-orange-hover text-white text-xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-glow hover:scale-[1.02]"
              >
                <Play className="w-7 h-7 fill-current" />
                开始训练
              </button>
              
              <button
                onClick={() => toggleFavorite(course.id)}
                className={cn(
                  'focusable w-full mt-4 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                  favorite
                    ? 'bg-soft-yellow/20 text-soft-yellow border border-soft-yellow/30'
                    : 'bg-navy-medium text-text-secondary hover:text-white hover:bg-navy-light'
                )}
              >
                <Star className={cn('w-5 h-5', favorite && 'fill-current')} />
                {favorite ? '已收藏' : '收藏课程'}
              </button>
            </div>

            {/* 注意事项 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-soft-yellow" />
                注意事项
              </h3>
              <div className="space-y-3">
                {course.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vibrant-orange/20 text-vibrant-orange flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 适合人群 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <h3 className="text-lg font-bold text-white mb-4">适合人群</h3>
              <div className="flex flex-wrap gap-2">
                {course.suitableFor.map((item, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-mint-green/10 text-mint-green rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* 动作列表 */}
            <div className="tv-card animate-slide-up" style={{ animationDelay: '0.45s' }}>
              <h3 className="text-lg font-bold text-white mb-4">
                全部动作 <span className="text-text-secondary font-normal">({course.exercises.length})</span>
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {course.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer',
                      selectedExerciseIndex === index
                        ? 'bg-vibrant-orange/10'
                        : 'hover:bg-white/5'
                    )}
                    onClick={() => setSelectedExerciseIndex(index)}
                  >
                    <span className="w-8 h-8 rounded-full bg-navy-medium flex items-center justify-center text-sm font-bold text-text-secondary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{exercise.name}</p>
                        <span className={cn(
                          'flex-shrink-0 text-xs px-2 py-0.5 rounded-full',
                          phaseInfo[exercise.phase || 'main'].bgColor,
                          phaseInfo[exercise.phase || 'main'].color
                        )}>
                          {phaseInfo[exercise.phase || 'main'].label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{formatTime(exercise.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
