import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, X, CheckCircle, Flame, Trophy, Clock, ArrowRight } from 'lucide-react';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useCourseStore } from '@/stores/useCourseStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { formatTime, cn } from '@/lib/utils';

export default function Workout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById } = useCourseStore();
  const { addRecord } = useHistoryStore();
  const { getCurrentMember } = useMemberStore();

  const {
    course,
    currentExerciseIndex,
    currentTime,
    isPlaying,
    isCompleted,
    totalCompletedExercises,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    nextExercise,
    prevExercise,
    tick,
    resetWorkout,
    completeWorkout,
    getCurrentExercise,
    getTotalDuration,
    getCompletedDuration,
    getNextExercise,
  } = useWorkoutStore();

  const courseData = getCourseById(id || '');
  const currentExercise = getCurrentExercise();
  const nextExerciseItem = getNextExercise();
  const totalDuration = getTotalDuration();
  const completedDuration = getCompletedDuration();

  const currentMember = getCurrentMember();

  const handlePlayPause = useCallback(() => {
    if (isCompleted) return;
    if (isPlaying) {
      pauseWorkout();
    } else {
      resumeWorkout();
    }
  }, [isPlaying, isCompleted, pauseWorkout, resumeWorkout]);

  const handleNext = useCallback(() => {
    if (isCompleted) return;
    nextExercise();
  }, [nextExercise, isCompleted]);

  const handlePrev = useCallback(() => {
    if (isCompleted) return;
    prevExercise();
  }, [prevExercise, isCompleted]);

  const handleExit = useCallback(() => {
    resetWorkout();
    navigate(`/course/${id}`);
  }, [resetWorkout, navigate, id]);

  const handleFinish = useCallback(() => {
    const record = completeWorkout();
    if (record && currentMember) {
      addRecord({
        ...record,
        memberId: currentMember.id,
      });
    }
    resetWorkout();
    navigate('/history');
  }, [completeWorkout, addRecord, currentMember, resetWorkout, navigate]);

  useKeyboardNavigation({
    onEnter: handlePlayPause,
    onPlayPause: handlePlayPause,
    onBack: handleExit,
    onLeft: handlePrev,
    onRight: handleNext,
  });

  useEffect(() => {
    if (courseData && !course) {
      startWorkout(courseData);
    }
  }, [courseData, course, startWorkout]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, tick]);

  const exerciseDuration = currentExercise?.duration || 0;
  const exerciseProgress = exerciseDuration > 0 ? (currentTime / exerciseDuration) * 100 : 0;
  const totalProgress = totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;

  const isLastSeconds = exerciseDuration - currentTime <= 3 && exerciseDuration - currentTime > 0;

  if (!course) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  // 完成页面
  if (isCompleted) {
    const finalRecord = completeWorkout();
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-8">
        <div className="text-center animate-scale-in max-w-lg">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-mint-green to-teal-400 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">训练完成！</h1>
          <p className="text-xl text-text-secondary mb-10">太棒了，你完成了 {course.title}</p>
          
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="tv-card text-center">
              <Clock className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{finalRecord?.duration || 0}</p>
              <p className="text-sm text-text-secondary">分钟</p>
            </div>
            <div className="tv-card text-center">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{finalRecord?.calories || 0}</p>
              <p className="text-sm text-text-secondary">千卡</p>
            </div>
            <div className="tv-card text-center">
              <CheckCircle className="w-8 h-8 text-mint-green mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{finalRecord?.completionRate || 0}%</p>
              <p className="text-sm text-text-secondary">完成率</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="tv-btn-secondary px-8 py-4"
            >
              返回首页
            </button>
            <button
              onClick={handleFinish}
              className="tv-btn-primary px-8 py-4 flex items-center gap-2"
            >
              查看记录
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="focusable w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{course.title}</h2>
            <p className="text-text-secondary text-sm">
              第 {currentExerciseIndex + 1} / {course.exercises.length} 个动作
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-white">{formatTime(completedDuration)}</p>
          <p className="text-text-secondary text-sm">总时长</p>
        </div>
      </div>

      {/* 总进度条 */}
      <div className="px-6 pb-4">
        <div className="h-2 bg-navy-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vibrant-orange to-orange-hover transition-all duration-300 rounded-full"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* 动作演示区 */}
        <div className="relative w-full max-w-3xl mb-8">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={currentExercise?.image}
              alt={currentExercise?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 via-transparent to-deep-navy/30" />
            
            {/* 暂停遮罩 */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-deep-navy/70 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-12 h-12 text-white ml-2" />
                </div>
              </div>
            )}
          </div>

          {/* 倒计时数字 */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center font-bold text-4xl transition-all duration-300',
                isLastSeconds
                  ? 'bg-red-500 text-white animate-pulse scale-110'
                  : 'bg-vibrant-orange text-white',
                isPlaying && !isLastSeconds && 'animate-breathe'
              )}
            >
              {Math.max(0, (currentExercise?.duration || 0) - currentTime)}
            </div>
          </div>
        </div>

        {/* 动作信息 */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl font-bold text-white mb-3">{currentExercise?.name}</h1>
          <p className="text-xl text-text-secondary max-w-2xl">{currentExercise?.description}</p>
        </div>

        {/* 当前动作进度条 */}
        <div className="w-full max-w-md mb-8">
          <div className="h-3 bg-navy-light rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isLastSeconds ? 'bg-red-500' : 'bg-gradient-to-r from-vibrant-orange to-orange-hover'
              )}
              style={{ width: `${exerciseProgress}%` }}
            />
          </div>
        </div>

        {/* 下一个动作预告 */}
        {nextExerciseItem && (
          <div className="flex items-center gap-3 text-text-secondary mb-8">
            <span>下一个动作：</span>
            <span className="text-white font-medium">{nextExerciseItem.name}</span>
            <span className="text-sm">({nextExerciseItem.duration}秒)</span>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            disabled={currentExerciseIndex === 0}
            className={cn(
              'tv-btn-icon bg-navy-light text-white',
              currentExerciseIndex === 0 && 'opacity-30 cursor-not-allowed'
            )}
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-24 h-24 rounded-full bg-vibrant-orange text-white flex items-center justify-center hover:bg-orange-hover transition-all hover:scale-105 shadow-glow focus:shadow-focus focus:outline-none"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="tv-btn-icon bg-navy-light text-white hover:bg-navy-medium"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* 操作提示 */}
        <div className="flex items-center gap-6 mt-8 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-navy-light rounded text-xs">空格</kbd>
            播放/暂停
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-navy-light rounded text-xs">← →</kbd>
            上一个/下一个
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-navy-light rounded text-xs">ESC</kbd>
            退出
          </span>
        </div>
      </div>
    </div>
  );
}
