import { History, Flame, Clock, CheckCircle, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { cn, formatDate, formatMinutes, getCategoryName } from '@/lib/utils';

export default function HistoryPage() {
  const { getMemberRecords, getMemberStats, getWeeklyStats } = useHistoryStore();
  const { getCurrentMember, members, switchMember, currentMemberId } = useMemberStore();

  const currentMember = getCurrentMember();
  const records = getMemberRecords(currentMemberId);
  const stats = getMemberStats(currentMemberId);
  const weeklyStats = getWeeklyStats(currentMemberId);

  const maxDuration = Math.max(...weeklyStats.map((s) => s.duration), 1);

  const statCards = [
    {
      label: '训练次数',
      value: stats.totalWorkouts,
      unit: '次',
      icon: History,
      color: 'text-vibrant-orange',
      bgColor: 'bg-vibrant-orange/10',
    },
    {
      label: '总时长',
      value: formatMinutes(stats.totalDuration),
      unit: '',
      icon: Clock,
      color: 'text-mint-green',
      bgColor: 'bg-mint-green/10',
    },
    {
      label: '消耗热量',
      value: stats.totalCalories,
      unit: '千卡',
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      label: '平均完成率',
      value: stats.avgCompletionRate,
      unit: '%',
      icon: CheckCircle,
      color: 'text-soft-yellow',
      bgColor: 'bg-soft-yellow/10',
    },
  ];

  // 按日期分组记录
  const groupedRecords = records.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, typeof records>);

  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-16">
      <div className="container mx-auto px-8">
        {/* 页面标题和成员切换 */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <History className="w-10 h-10 text-vibrant-orange" />
            <div>
              <h1 className="text-3xl font-bold text-white">历史记录</h1>
              <p className="text-text-secondary mt-1">
                查看你的训练数据和成就
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm mr-2">切换成员：</span>
            {members.slice(0, 4).map((member) => (
              <button
                key={member.id}
                onClick={() => switchMember(member.id)}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                  member.id === currentMemberId
                    ? 'ring-2 ring-vibrant-orange scale-110'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                {member.avatar}
              </button>
            ))}
          </div>
        </div>

        {/* 连续天数卡片 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-vibrant-orange/20 via-vibrant-orange/10 to-transparent p-8 mb-10 animate-fade-in">
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-vibrant-orange/20 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-vibrant-orange" />
            </div>
            <div>
              <p className="text-text-secondary mb-1">连续训练</p>
              <h2 className="text-5xl font-bold text-white">
                {stats.streakDays} <span className="text-2xl text-text-secondary">天</span>
              </h2>
              <p className="text-mint-green mt-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                保持得很棒，继续加油！
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20">
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl">
              🔥
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="tv-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', card.bgColor)}>
                    <Icon className={cn('w-7 h-7', card.color)} />
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">{card.label}</p>
                    <p className="text-2xl font-bold text-white">
                      {card.value}
                      <span className="text-base text-text-secondary font-normal ml-1">{card.unit}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* 周报图表 */}
          <div className="col-span-2 tv-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-vibrant-orange" />
                本周训练
              </h3>
              <span className="text-text-secondary text-sm">
                共 {weeklyStats.reduce((sum, s) => sum + s.duration, 0)} 分钟
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 h-64 px-4">
              {weeklyStats.map((stat, index) => {
                const height = stat.duration > 0 ? (stat.duration / maxDuration) * 100 : 0;
                const isToday = index === weeklyStats.length - 1;
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <span className="text-sm text-text-secondary mb-2">
                      {stat.duration > 0 ? `${stat.duration}分` : ''}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={cn(
                          'w-full rounded-t-xl transition-all duration-500 min-h-[4px]',
                          isToday
                            ? 'bg-gradient-to-t from-vibrant-orange to-orange-hover'
                            : 'bg-gradient-to-t from-navy-medium to-mint-green/30'
                        )}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'mt-3 text-sm font-medium',
                        isToday ? 'text-vibrant-orange' : 'text-text-secondary'
                      )}
                    >
                      {stat.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 最近记录 */}
          <div className="tv-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-xl font-bold text-white mb-6">最近训练</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {records.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-navy-medium/50 rounded-xl hover:bg-navy-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white line-clamp-1">{record.courseTitle}</span>
                    <span className="text-xs text-text-muted whitespace-nowrap ml-2">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{record.duration} 分钟</span>
                    <span>{record.calories} 千卡</span>
                    <span className="text-mint-green">{record.completionRate}%</span>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-secondary">暂无训练记录</p>
                  <p className="text-text-muted text-sm mt-1">开始你的第一次训练吧</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 全部训练记录 */}
        <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-bold text-white mb-6">全部训练记录</h3>

          {sortedDates.length > 0 ? (
            <div className="space-y-8">
              {sortedDates.map((date) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-text-muted" />
                    <span className="font-medium text-text-secondary">
                      {formatDate(date)}
                    </span>
                    <span className="text-sm text-text-muted">
                      ({groupedRecords[date].length} 次训练)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {groupedRecords[date].map((record) => (
                      <div
                        key={record.id}
                        className="tv-card hover:shadow-glow transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white group-hover:text-vibrant-orange transition-colors">
                              {record.courseTitle}
                            </h4>
                            <p className="text-sm text-text-secondary mt-1">
                              {getCategoryName(record.courseCategory)}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-vibrant-orange transition-colors" />
                        </div>

                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-text-muted" />
                            <span className="text-text-secondary">{record.duration} 分钟</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-text-secondary">{record.calories} 千卡</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-mint-green" />
                            <span className="text-mint-green">{record.completionRate}% 完成</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                            <span>完成进度</span>
                            <span>{record.completedExercises}/{record.totalExercises} 个动作</span>
                          </div>
                          <div className="h-2 bg-navy-medium rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-mint-green to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${record.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tv-card text-center py-16">
              <History className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <p className="text-xl text-text-secondary">还没有训练记录</p>
              <p className="text-text-muted mt-2">完成一次训练后，这里会显示你的记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
