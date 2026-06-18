import { useState, useMemo } from 'react';
import { History, Flame, Clock, CheckCircle, TrendingUp, Calendar, ChevronRight, Target, Award, Sparkles, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { cn, formatDate, formatMinutes, getCategoryName } from '@/lib/utils';
import { ReportRange } from '@/types';

export default function HistoryPage() {
  const { getMemberRecords, getMemberStats, getWeeklyStats, getWeeklyReport, calculateStreakDays } = useHistoryStore();
  const { getCurrentMember, members, switchMember, currentMemberId, childMode } = useMemberStore();
  const { getWeeklyProgress, getThisWeekPlans } = usePlanStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'records'>('overview');
  const [reportRange, setReportRange] = useState<ReportRange>('week');

  const currentMember = getCurrentMember();
  const records = getMemberRecords(currentMemberId, childMode);
  const stats = getMemberStats(currentMemberId);
  const weeklyStats = getWeeklyStats(currentMemberId, reportRange);
  const weeklyReport = currentMember
    ? getWeeklyReport(currentMemberId, currentMember.name, reportRange, childMode)
    : null;
  const streakDays = calculateStreakDays(currentMemberId);
  const weeklyProgress = getWeeklyProgress(currentMemberId);
  const weekPlans = getThisWeekPlans(currentMemberId);

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

  const tabs = [
    { id: 'overview', label: '总览' },
    { id: 'weekly', label: '家庭周报' },
    { id: 'records', label: '全部记录' },
  ];

  const rangeOptions = [
    { id: 'week', label: '本周' },
    { id: 'last-week', label: '上周' },
    { id: 'month', label: '近30天' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-16">
      <div className="container mx-auto px-8">
        {/* 页面标题和成员切换 */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-vibrant-orange text-white'
                  : 'bg-navy-medium text-text-secondary hover:text-white hover:bg-navy-light'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 总览 Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* 连续天数卡片 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-vibrant-orange/20 via-vibrant-orange/10 to-transparent p-8 mb-10">
              <div className="relative z-10 flex items-center gap-8">
                <div className="w-20 h-20 rounded-full bg-vibrant-orange/20 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-vibrant-orange" />
                </div>
                <div>
                  <p className="text-text-secondary mb-1">连续训练</p>
                  <h2 className="text-5xl font-bold text-white">
                    {streakDays} <span className="text-2xl text-text-secondary">天</span>
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

            {/* 本周计划进度 */}
            {weeklyProgress.total > 0 && (
              <div className="tv-card mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-mint-green" />
                    本周训练计划进度
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary">完成进度</span>
                    <span className="text-white font-medium">
                      完成 {weeklyProgress.completed}/{weeklyProgress.total}（{weeklyProgress.percentage}%）
                    </span>
                  </div>
                  <div className="h-3 bg-navy-medium rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-mint-green to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${weeklyProgress.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-navy-medium/50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-mint-green">{weeklyProgress.completed}</p>
                    <p className="text-sm text-text-secondary mt-1">已完成</p>
                  </div>
                  <div className="p-4 bg-navy-medium/50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-soft-yellow">{weeklyProgress.skipped}</p>
                    <p className="text-sm text-text-secondary mt-1">跳过</p>
                  </div>
                  <div className="p-4 bg-navy-medium/50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-orange-400">{weeklyProgress.missed}</p>
                    <p className="text-sm text-text-secondary mt-1">未完成</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-8">
              {/* 周报图表 */}
              <div className="col-span-2 tv-card">
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
              <div className="tv-card">
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
          </div>
        )}

        {/* 家庭周报 Tab */}
        {activeTab === 'weekly' && weeklyReport && (
          <div className="animate-fade-in">
            {/* 时间范围切换 */}
            <div className="flex gap-2 mb-8">
              {rangeOptions.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setReportRange(range.id as ReportRange)}
                  className={cn(
                    'px-5 py-2 rounded-xl font-medium transition-all',
                    reportRange === range.id
                      ? 'bg-mint-green text-white'
                      : 'bg-navy-medium text-text-secondary hover:text-white hover:bg-navy-light'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* 周报头部 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vibrant-orange/20 via-mint-green/10 to-purple-500/10 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-vibrant-orange" />
                    <span className="text-vibrant-orange font-medium">家庭周报</span>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {weeklyReport.memberName}的报告
                  </h2>
                  <p className="text-text-secondary">
                    {reportRange === 'week' && '本周'}
                    {reportRange === 'last-week' && '上周'}
                    {reportRange === 'month' && '近30天'}
                    一共训练了 {weeklyReport.totalWorkouts} 次，继续加油！
                  </p>
                </div>
                <div className="text-8xl opacity-20">
                  {currentMember?.avatar || '🏆'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="tv-card text-center">
                <Target className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{weeklyReport.totalWorkouts}</p>
                <p className="text-sm text-text-secondary">训练频次</p>
                {weeklyReport.improvement.workoutCountChange !== 0 && (
                  <p className={cn(
                    'text-xs mt-1 flex items-center justify-center gap-1',
                    weeklyReport.improvement.workoutCountChange > 0 ? 'text-mint-green' : 'text-orange-400'
                  )}>
                    {weeklyReport.improvement.workoutCountChange > 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(weeklyReport.improvement.workoutCountChange)}% 较上个周期
                  </p>
                )}
              </div>
              <div className="tv-card text-center">
                <Clock className="w-8 h-8 text-mint-green mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">
                  {formatMinutes(weeklyReport.totalDuration)}
                </p>
                <p className="text-sm text-text-secondary">总时长</p>
                {weeklyReport.improvement.durationChange !== 0 && (
                  <p className={cn(
                    'text-xs mt-1 flex items-center justify-center gap-1',
                    weeklyReport.improvement.durationChange > 0 ? 'text-mint-green' : 'text-orange-400'
                  )}>
                    {weeklyReport.improvement.durationChange > 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(weeklyReport.improvement.durationChange)}% 较上个周期
                  </p>
                )}
              </div>
              <div className="tv-card text-center">
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{weeklyReport.totalCalories}</p>
                <p className="text-sm text-text-secondary">消耗热量</p>
                <p className="text-xs text-text-muted mt-1">千卡</p>
              </div>
              <div className="tv-card text-center">
                <CheckCircle className="w-8 h-8 text-soft-yellow mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{weeklyReport.avgCompletionRate}%</p>
                <p className="text-sm text-text-secondary">平均完成率</p>
                {weeklyReport.improvement.completionRateChange !== 0 && (
                  <p className={cn(
                    'text-xs mt-1 flex items-center justify-center gap-1',
                    weeklyReport.improvement.completionRateChange > 0 ? 'text-mint-green' : 'text-orange-400'
                  )}>
                    {weeklyReport.improvement.completionRateChange > 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(weeklyReport.improvement.completionRateChange)}% 较上个周期
                  </p>
                )}
              </div>
            </div>

            {/* 本周计划完成情况 */}
            {reportRange === 'week' && weeklyReport.planReview.length > 0 && (
              <div className="tv-card mb-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-soft-yellow" />
                  计划完成情况
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {weeklyReport.planReview.map((review) => {
                    const total = review.completedOnTime + review.completedMakeup;
                    const percentage = Math.round((total / review.scheduled) * 100);
                    const isCompleted = total >= review.scheduled;
                    return (
                      <div key={review.planId} className="p-4 bg-navy-medium/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-white">{review.courseTitle}</span>
                          <span className={cn(
                            'text-sm font-bold',
                            isCompleted ? 'text-mint-green' : 'text-vibrant-orange'
                          )}>
                            {total}/{review.scheduled} 次
                          </span>
                        </div>
                        <div className="h-2 bg-navy-medium rounded-full overflow-hidden">
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
                        <div className="flex gap-3 mt-3 text-xs flex-wrap">
                          <span className="text-mint-green">按时 {review.completedOnTime}</span>
                          <span className="text-teal-400">补练 {review.completedMakeup}</span>
                          <span className="text-soft-yellow">跳过 {review.skipped}</span>
                          <span className="text-orange-400">未完成 {review.missed}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-8">
              {/* 每日训练详情 */}
              <div className="col-span-2 tv-card">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-vibrant-orange" />
                  每日训练详情
                </h3>
                <div className="flex items-end justify-between gap-4 h-56 px-4 mb-6">
                  {weeklyReport.dailyStats.map((stat, index) => {
                    const maxDur = Math.max(...weeklyReport.dailyStats.map(s => s.duration), 1);
                    const height = stat.duration > 0 ? (stat.duration / maxDur) * 100 : 0;
                    const isToday = index === weeklyReport.dailyStats.length - 1 && reportRange === 'week';
                    return (
                      <div key={stat.date} className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-text-secondary mb-2 h-6">
                          {stat.duration > 0 ? `${stat.duration}分` : ''}
                        </div>
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
                        {stat.workoutCount > 0 && (
                          <span className="text-xs text-text-muted mt-1">
                            {stat.workoutCount}次
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 偏好课程类型 */}
              <div className="tv-card">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-soft-yellow" />
                  偏好类型
                </h3>
                {weeklyReport.categoryBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyReport.categoryBreakdown.map((item, index) => (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {getCategoryName(item.category)}
                          </span>
                          <span className="text-text-secondary text-sm">
                            {item.count}次 · {formatMinutes(item.duration)}
                          </span>
                        </div>
                        <div className="h-2 bg-navy-medium rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              index === 0
                                ? 'bg-gradient-to-r from-vibrant-orange to-orange-hover'
                                : index === 1
                                ? 'bg-gradient-to-r from-mint-green to-teal-400'
                                : 'bg-gradient-to-r from-purple-500 to-purple-400'
                            )}
                            style={{
                              width: `${(item.duration / weeklyReport.totalDuration) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">本周期暂无训练</p>
                  </div>
                )}

                {weeklyReport.favoriteCategory && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-sm text-text-secondary mb-2">最喜欢的类型</p>
                    <p className="text-lg font-bold text-vibrant-orange">
                      {getCategoryName(weeklyReport.favoriteCategory)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 训练建议 */}
            <div className="mt-8 tv-card bg-gradient-to-r from-mint-green/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-mint-green" />
                训练建议
              </h3>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                💡 {weeklyReport.advice}
              </p>

              {/* 详细建议 */}
              {weeklyReport.detailedAdvice && weeklyReport.detailedAdvice.length > 0 && (
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">详细建议</h4>
                  <div className="space-y-3">
                    {weeklyReport.detailedAdvice.map((advice, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">
                          {index % 2 === 0 ? '✅' : '💡'}
                        </span>
                        <p className="text-text-secondary leading-relaxed">{advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 计划复盘 */}
            {weeklyReport.planReview && weeklyReport.planReview.length > 0 && (
              <div className="mt-8 tv-card">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-vibrant-orange" />
                  计划复盘
                </h3>
                <div className="space-y-4">
                  {weeklyReport.planReview.map((review) => (
                    <div
                      key={review.planId}
                      className="p-4 bg-navy-medium/50 rounded-xl"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.courseCover}
                          alt={review.courseTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white text-lg">{review.courseTitle}</p>
                          <p className="text-sm text-text-muted mt-1">
                            安排 {review.scheduled} 次
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-mint-green/20 text-mint-green text-sm font-medium">
                          按时完成 {review.completedOnTime}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-400 text-sm font-medium">
                          补练 {review.completedMakeup}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-soft-yellow/20 text-soft-yellow text-sm font-medium">
                          跳过 {review.skipped}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-400/20 text-orange-400 text-sm font-medium">
                          未完成 {review.missed}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 连续天数 */}
            {weeklyReport.streakDays > 0 && (
              <div className="mt-6 flex items-center gap-4 text-text-secondary">
                <TrendingUp className="w-5 h-5 text-vibrant-orange" />
                <span>已连续坚持 <span className="text-white font-bold">{weeklyReport.streakDays}</span> 天</span>
              </div>
            )}
          </div>
        )}

        {/* 全部记录 Tab */}
        {activeTab === 'records' && (
          <div className="animate-fade-in">
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
                                style={{ width: `${Math.min(record.completionRate, 100)}%` }}
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
        )}
      </div>
    </div>
  );
}
