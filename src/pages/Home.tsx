import { useMemo } from 'react';
import { Sparkles, Clock, Flame, Zap, Wind, Dumbbell, Heart, Target, Calendar, ChevronRight } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { useCourseStore } from '@/stores/useCourseStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { cn, getCategoryName } from '@/lib/utils';
import { CourseCategory, Difficulty, DurationFilter } from '@/types';
import { useNavigate } from 'react-router-dom';

const categories: { id: CourseCategory | 'all'; name: string; icon: any }[] = [
  { id: 'all', name: '全部', icon: Sparkles },
  { id: 'stretch', name: '拉伸', icon: Wind },
  { id: 'fatburn', name: '燃脂', icon: Flame },
  { id: 'strength', name: '力量', icon: Dumbbell },
  { id: 'neck', name: '肩颈放松', icon: Heart },
];

const difficulties: { id: Difficulty | 'all'; name: string }[] = [
  { id: 'all', name: '全部难度' },
  { id: 'easy', name: '简单' },
  { id: 'medium', name: '中等' },
  { id: 'hard', name: '困难' },
];

const durations: { id: DurationFilter; name: string; icon: any }[] = [
  { id: 'all', name: '全部时长', icon: Clock },
  { id: 'short', name: '10分钟内', icon: Zap },
  { id: 'medium', name: '10-20分钟', icon: Clock },
  { id: 'long', name: '20分钟以上', icon: Clock },
];

export default function Home() {
  const navigate = useNavigate();
  const {
    selectedCategory,
    selectedDifficulty,
    selectedDuration,
    setCategory,
    setDifficulty,
    setDuration,
    getFilteredCourses,
    getRecommendedCourses,
  } = useCourseStore();

  const { getCurrentMember, childMode, currentMemberId } = useMemberStore();
  const { calculateStreakDays } = useHistoryStore();
  const { getThisWeekPlans, getWeeklyProgress } = usePlanStore();

  const currentMember = getCurrentMember();
  const recommended = getRecommendedCourses();
  const streakDays = calculateStreakDays(currentMemberId);
  const weekPlans = getThisWeekPlans(currentMemberId);
  const weeklyProgress = getWeeklyProgress(currentMemberId);

  const filteredCourses = useMemo(() => {
    let courses = getFilteredCourses();
    if (childMode) {
      courses = courses.filter((c) => c.isForChildren || c.difficulty === 'easy');
    }
    return courses;
  }, [getFilteredCourses, childMode]);

  const childFriendlyRecommended = useMemo(() => {
    if (!childMode) return recommended;
    return recommended.filter((c) => c.isForChildren || c.difficulty === 'easy');
  }, [recommended, childMode]);

  const childFriendlyFavoritesCount = useMemo(() => {
    if (!childMode || !currentMember) return currentMember?.favorites.length || 0;
    return currentMember.favorites.length;
  }, [currentMember, childMode]);

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-16">
      <div className="container mx-auto px-8">
        {/* 欢迎区域 */}
        <section className="mb-12 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-vibrant-orange/20 via-navy-medium to-mint-green/10 p-10">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                {childMode ? '小朋友你好呀 👋' : `欢迎回来，${currentMember?.name}！`}
              </h1>
              <p className="text-xl text-text-secondary mb-6">
                {childMode
                  ? '今天也要活力满满，一起来运动吧！'
                  : '今天想做什么训练？选择一个课程，开始你的健身之旅。'}
              </p>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-vibrant-orange">{streakDays}</p>
                  <p className="text-sm text-text-secondary">连续天数</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-mint-green">{childFriendlyFavoritesCount}</p>
                  <p className="text-sm text-text-secondary">收藏课程</p>
                </div>
                {weekPlans.length > 0 && (
                  <>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-soft-yellow">
                        {weeklyProgress.completed}/{weeklyProgress.total}
                      </p>
                      <p className="text-sm text-text-secondary">本周计划</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"
                alt="健身"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-deep-navy via-deep-navy/50 to-transparent" />
            </div>
          </div>
        </section>

        {/* 本周训练计划 */}
        {weekPlans.length > 0 && (
          <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="w-7 h-7 text-mint-green" />
                <h2 className="text-2xl font-bold text-white">本周训练计划</h2>
                <span className="px-3 py-1 bg-mint-green/20 text-mint-green text-sm rounded-full">
                  {weeklyProgress.percentage}% 完成
                </span>
              </div>
              <button
                onClick={() => navigate('/family')}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
              >
                管理计划
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {weekPlans.slice(0, 3).map((plan) => {
                const percentage = Math.round((plan.completedCount / plan.targetCount) * 100);
                const isCompleted = plan.completedCount >= plan.targetCount;
                return (
                  <div
                    key={plan.id}
                    className="tv-card hover:shadow-glow transition-all cursor-pointer group"
                    onClick={() => navigate(`/course/${plan.courseId}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-vibrant-orange transition-colors">
                        {plan.courseTitle}
                      </h3>
                      <span className={cn(
                        'text-lg font-bold',
                        isCompleted ? 'text-mint-green' : 'text-vibrant-orange'
                      )}>
                        {plan.completedCount}/{plan.targetCount}
                      </span>
                    </div>

                    <div className="h-2 bg-navy-medium rounded-full overflow-hidden mb-3">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isCompleted
                            ? 'bg-gradient-to-r from-mint-green to-teal-400'
                            : 'bg-gradient-to-r from-vibrant-orange to-orange-hover'
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">
                        {isCompleted ? '🎉 已完成目标' : '继续加油！'}
                      </span>
                      {plan.reminderTime && (
                        <span className="text-text-muted flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {plan.reminderTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 今日推荐 */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-vibrant-orange" />
            <h2 className="text-2xl font-bold text-white">
              今日推荐
            </h2>
            {childMode && (
              <span className="px-3 py-1 bg-mint-green/20 text-mint-green text-sm rounded-full">
                儿童友好
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-6">
            {(childMode ? childFriendlyRecommended : recommended).slice(0, 4).map((course, index) => (
              <div
                key={course.id}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                className="animate-scale-in"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
          {childMode && childFriendlyRecommended.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-secondary">暂无适合儿童的推荐课程</p>
            </div>
          )}
        </section>

        {/* 分类筛选 */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'focusable flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 whitespace-nowrap',
                    isActive
                      ? 'bg-vibrant-orange text-white shadow-glow scale-105'
                      : 'bg-navy-light text-text-secondary hover:bg-navy-medium hover:text-white'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* 二级筛选 */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-text-secondary text-sm">难度：</span>
              <div className="flex gap-2">
                {(childMode ? difficulties.filter(d => d.id === 'all' || d.id === 'easy') : difficulties).map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={cn(
                      'focusable px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      selectedDifficulty === diff.id
                        ? 'bg-mint-green/20 text-mint-green border border-mint-green/30'
                        : 'bg-navy-light text-text-secondary hover:bg-navy-medium hover:text-white'
                    )}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex items-center gap-3">
              <span className="text-text-secondary text-sm">时长：</span>
              <div className="flex gap-2">
                {durations.map((dur) => (
                  <button
                    key={dur.id}
                    onClick={() => setDuration(dur.id)}
                    className={cn(
                      'focusable px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                      selectedDuration === dur.id
                        ? 'bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/30'
                        : 'bg-navy-light text-text-secondary hover:bg-navy-medium hover:text-white'
                    )}
                  >
                    <dur.icon className="w-4 h-4" />
                    {dur.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 课程列表 */}
        <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? '全部课程' : getCategoryName(selectedCategory as CourseCategory)}
              <span className="text-lg text-text-secondary ml-3">({filteredCourses.length} 个课程)</span>
            </h2>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-4 gap-6">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.id}
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  className="animate-scale-in"
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-text-secondary">暂无符合条件的课程</p>
              <p className="text-text-muted mt-2">试试调整筛选条件吧</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
