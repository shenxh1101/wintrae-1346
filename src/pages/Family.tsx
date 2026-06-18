import { useState } from 'react';
import {
  Users,
  Plus,
  Star,
  Bell,
  Target,
  Check,
  ChevronRight,
  X,
  Clock,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCourseStore } from '@/stores/useCourseStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { cn, formatDate } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Course, DayOfWeek, PlanStatus } from '@/types';

const avatarOptions = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👱'];

const goalOptions = [
  '增强体质',
  '保持身材',
  '减脂塑形',
  '增肌力量',
  '健康成长',
  '活动筋骨',
  '缓解压力',
  '改善睡眠',
];

const restReminderOptions = [
  { value: 15, label: '15分钟' },
  { value: 30, label: '30分钟' },
  { value: 45, label: '45分钟' },
  { value: 60, label: '60分钟' },
  { value: 90, label: '90分钟' },
];

const dayOptions: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: '周一', short: '一' },
  { value: 2, label: '周二', short: '二' },
  { value: 3, label: '周三', short: '三' },
  { value: 4, label: '周四', short: '四' },
  { value: 5, label: '周五', short: '五' },
  { value: 6, label: '周六', short: '六' },
  { value: 0, label: '周日', short: '日' },
];
const reminderTimeOptions = ['07:00', '08:00', '09:00', '12:00', '18:00', '19:00', '20:00', '21:00'];

const getStatusStyle = (status: PlanStatus): { bg: string; border: string; overlay?: string } => {
  switch (status) {
    case 'completed-on-time':
      return { bg: 'bg-mint-green/20', border: 'border-mint-green/50' };
    case 'completed-makeup':
      return { bg: 'bg-sky-400/20', border: 'border-sky-400/50' };
    case 'skipped':
      return { bg: 'bg-soft-yellow/20', border: 'border-soft-yellow/50', overlay: 'bg-soft-yellow/30' };
    case 'missed':
      return { bg: 'bg-red-400/20', border: 'border-red-400/50' };
    default:
      return { bg: 'bg-navy-medium/50', border: 'border-white/10' };
  }
};

const getStatusLabel = (status: PlanStatus): string => {
  switch (status) {
    case 'completed-on-time':
      return '已完成';
    case 'completed-makeup':
      return '已补练';
    case 'skipped':
      return '已跳过';
    case 'missed':
      return '已错过';
    default:
      return '待完成';
  }
};

const formatDaysOfWeek = (days: DayOfWeek[]): string => {
  const sorted = [...days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
  return sorted.map((d) => dayOptions.find((o) => o.value === d)?.label?.slice(1) || '').join('/');
};

export default function Family() {
  const {
    members,
    currentMemberId,
    childMode,
    switchMember,
    toggleChildMode,
    updateMember,
    addMember,
  } = useMemberStore();
  const { courses } = useCourseStore();
  const { calculateStreakDays } = useHistoryStore();
  const { getThisWeekPlans, addPlan, removePlan, getWeeklyProgress, getWeeklySchedule } = usePlanStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'plans' | 'settings'>('info');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState(avatarOptions[0]);
  const [newMemberIsChild, setNewMemberIsChild] = useState(false);

  const [newPlanCourseId, setNewPlanCourseId] = useState('');
  const [newPlanDaysOfWeek, setNewPlanDaysOfWeek] = useState<DayOfWeek[]>([1, 3, 5]);
  const [newPlanReminderTime, setNewPlanReminderTime] = useState('');

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const memberPlans = selectedMember ? getThisWeekPlans(selectedMember.id) : [];
  const memberWeeklyProgress = selectedMember ? getWeeklyProgress(selectedMember.id) : { total: 0, completed: 0, percentage: 0, skipped: 0, missed: 0 };
  const memberWeeklySchedule = selectedMember ? getWeeklySchedule(selectedMember.id) : [];
  const memberStreakDays = selectedMember ? calculateStreakDays(selectedMember.id) : 0;

  useKeyboardNavigation({
    onBack: () => {
      if (showAddModal) {
        setShowAddModal(false);
      } else if (showAddPlanModal) {
        setShowAddPlanModal(false);
      } else if (selectedMemberId) {
        setSelectedMemberId(null);
      }
    },
  });

  const handleSelectMember = (id: string) => {
    switchMember(id);
    setSelectedMemberId(id);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;

    addMember({
      name: newMemberName.trim(),
      avatar: newMemberAvatar,
      isChild: newMemberIsChild,
      goal: newMemberIsChild ? '健康成长' : '增强体质',
      restReminder: 30,
      streakDays: 0,
      favorites: [],
    });

    setNewMemberName('');
    setNewMemberAvatar(avatarOptions[0]);
    setNewMemberIsChild(false);
    setShowAddModal(false);
  };

  const handleAddPlan = () => {
    if (!selectedMemberId || !newPlanCourseId || newPlanDaysOfWeek.length === 0) return;

    const course = courses.find((c) => c.id === newPlanCourseId);
    if (!course) return;

    addPlan({
      memberId: selectedMemberId,
      courseId: newPlanCourseId,
      courseTitle: course.title,
      courseCover: course.cover,
      daysOfWeek: newPlanDaysOfWeek,
      reminderTime: newPlanReminderTime || undefined,
    });

    setNewPlanCourseId('');
    setNewPlanDaysOfWeek([1, 3, 5]);
    setNewPlanReminderTime('');
    setShowAddPlanModal(false);
  };

  const toggleDayOfWeek = (day: DayOfWeek) => {
    setNewPlanDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getFavoriteCourses = (favorites: string[]) => {
    let result = courses.filter((c) => favorites.includes(c.id));
    if (childMode) {
      result = result.filter((c) => c.isForChildren || c.difficulty === 'easy');
    }
    return result;
  };

  const getAddableCourses = (): Course[] => {
    let result = courses.filter((c) => !memberPlans.some((p) => p.courseId === c.id));
    if (childMode || selectedMember?.isChild) {
      result = result.filter((c) => c.isForChildren || c.difficulty === 'easy');
    }
    return result;
  };

  // 成员详情视图
  if (selectedMember) {
    const favoriteCourses = getFavoriteCourses(selectedMember.favorites);

    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-16">
        <div className="container mx-auto px-8">
          <button
            onClick={() => setSelectedMemberId(null)}
            className="flex items-center gap-2 text-text-secondary hover:text-white mb-8 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>返回成员列表</span>
          </button>

          <div className="grid grid-cols-3 gap-8">
            {/* 左侧：成员信息 */}
            <div className="col-span-1">
              <div className="tv-card text-center animate-fade-in">
                <div className="w-32 h-32 mx-auto rounded-full bg-navy-medium flex items-center justify-center text-6xl mb-4">
                  {selectedMember.avatar}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedMember.name}</h2>
                {selectedMember.isChild && (
                  <span className="inline-block px-3 py-1 bg-soft-yellow/20 text-soft-yellow text-sm rounded-full mb-4">
                    👶 儿童账户
                  </span>
                )}
                <div className="flex justify-center gap-6 py-6 border-y border-white/10">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-vibrant-orange">{memberStreakDays}</p>
                    <p className="text-sm text-text-secondary">连续天数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-mint-green">{favoriteCourses.length}</p>
                    <p className="text-sm text-text-secondary">收藏课程</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-soft-yellow">
                      {memberWeeklyProgress.completed}/{memberWeeklyProgress.total}
                    </p>
                    <p className="text-sm text-text-secondary">本周计划</p>
                  </div>
                </div>
                {selectedMember.lastWorkoutDate && (
                  <p className="text-sm text-text-secondary mt-4">
                    上次训练：{formatDate(selectedMember.lastWorkoutDate)}
                  </p>
                )}
              </div>

              {/* 快捷操作 */}
              <div className="tv-card mt-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="font-bold text-white mb-4">快捷操作</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => switchMember(selectedMember.id)}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all',
                      currentMemberId === selectedMember.id
                        ? 'bg-vibrant-orange/20 text-vibrant-orange'
                        : 'bg-navy-medium text-white hover:bg-navy-light'
                    )}
                  >
                    <span>切换到当前用户</span>
                    {currentMemberId === selectedMember.id && <Check className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => toggleChildMode()}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all',
                      childMode ? 'bg-soft-yellow/20 text-soft-yellow' : 'bg-navy-medium text-white hover:bg-navy-light'
                    )}
                  >
                    <span>儿童模式</span>
                    <span className="text-sm">{childMode ? '已开启' : '未开启'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：详情内容 */}
            <div className="col-span-2">
              {/* 标签切换 */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { id: 'info', label: '基本信息', icon: Users },
                  { id: 'favorites', label: '收藏课程', icon: Star },
                  { id: 'plans', label: '训练计划', icon: Target },
                  { id: 'settings', label: '设置', icon: Bell },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-vibrant-orange text-white'
                        : 'bg-navy-light text-text-secondary hover:bg-navy-medium hover:text-white'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 基本信息 */}
              {activeTab === 'info' && (
                <div className="tv-card animate-fade-in">
                  <h3 className="text-xl font-bold text-white mb-6">基本信息</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">昵称</label>
                      <input
                        type="text"
                        value={selectedMember.name}
                        onChange={(e) =>
                          updateMember(selectedMember.id, { name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-navy-medium border border-white/10 rounded-xl text-white focus:border-vibrant-orange focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary text-sm mb-3">头像</label>
                      <div className="flex gap-3 flex-wrap">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            onClick={() => updateMember(selectedMember.id, { avatar })}
                            className={cn(
                              'w-14 h-14 rounded-full text-3xl flex items-center justify-center transition-all',
                              selectedMember.avatar === avatar
                                ? 'bg-vibrant-orange/20 ring-2 ring-vibrant-orange'
                                : 'bg-navy-medium hover:bg-navy-light'
                            )}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-white/5">
                      <div>
                        <p className="text-white font-medium">儿童账户</p>
                        <p className="text-sm text-text-secondary">开启后将只显示低强度内容</p>
                      </div>
                      <button
                        onClick={() =>
                          updateMember(selectedMember.id, { isChild: !selectedMember.isChild })
                        }
                        className={cn(
                          'w-14 h-8 rounded-full transition-all relative',
                          selectedMember.isChild ? 'bg-soft-yellow' : 'bg-navy-medium'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-1 w-6 h-6 bg-white rounded-full transition-all',
                            selectedMember.isChild ? 'left-7' : 'left-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 收藏课程 */}
              {activeTab === 'favorites' && (
                <div className="tv-card animate-fade-in">
                  <h3 className="text-xl font-bold text-white mb-6">
                    收藏课程 <span className="text-text-secondary font-normal">({favoriteCourses.length})</span>
                  </h3>
                  {favoriteCourses.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {favoriteCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex gap-4 p-3 bg-navy-medium rounded-xl hover:bg-navy-light transition-colors cursor-pointer"
                          onClick={() => (window.location.href = `/course/${course.id}`)}
                        >
                          <img
                            src={course.cover}
                            alt={course.title}
                            className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{course.title}</h4>
                            <p className="text-sm text-text-secondary">{course.duration} 分钟</p>
                          </div>
                          <Star className="w-5 h-5 text-soft-yellow fill-soft-yellow flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
                      <p className="text-text-secondary">还没有收藏课程</p>
                      <p className="text-text-muted text-sm mt-2">去首页发现喜欢的课程吧</p>
                    </div>
                  )}
                </div>
              )}

              {/* 训练计划 */}
              {activeTab === 'plans' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      本周训练计划
                      <span className="text-text-secondary font-normal ml-3">
                        {memberWeeklyProgress.completed}/{memberWeeklyProgress.total} 完成
                      </span>
                    </h3>
                    <button
                      onClick={() => setShowAddPlanModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white rounded-xl font-medium hover:bg-orange-hover transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      添加计划
                    </button>
                  </div>

                  {/* 计划卡片列表 */}
                  {memberPlans.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-text-secondary text-sm mb-3 font-medium">我的计划</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {memberPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className="tv-card p-3 relative"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={plan.courseCover}
                                alt={plan.courseTitle}
                                className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-white text-sm truncate">{plan.courseTitle}</h5>
                                <div className="flex items-center gap-1 mt-1 text-text-muted text-xs">
                                  <Calendar className="w-3 h-3" />
                                  {formatDaysOfWeek(plan.schedule.map((s) => s.dayOfWeek))}
                                </div>
                                {plan.schedule[0]?.reminderTime && (
                                  <div className="flex items-center gap-1 mt-0.5 text-text-muted text-xs">
                                    <Clock className="w-3 h-3" />
                                    {plan.schedule[0].reminderTime}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removePlan(plan.id)}
                              className="absolute top-2 right-2 p-1.5 text-text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 每周时间表 */}
                  <div className="tv-card">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-vibrant-orange" />
                      本周安排
                    </h4>
                    <div className="grid grid-cols-7 gap-2">
                      {memberWeeklySchedule.map((day) => (
                        <div key={day.date} className="flex flex-col">
                          <div className="text-center mb-2">
                            <p className={cn(
                              'text-xs font-medium',
                              day.dayOfWeek === new Date().getDay() ? 'text-vibrant-orange' : 'text-text-secondary'
                            )}>
                              {dayOptions.find((o) => o.value === day.dayOfWeek)?.label}
                            </p>
                            <p className={cn(
                              'text-lg font-bold',
                              day.dayOfWeek === new Date().getDay() ? 'text-vibrant-orange' : 'text-white'
                            )}>
                              {new Date(day.date).getDate()}
                            </p>
                          </div>
                          <div className="space-y-2 min-h-[100px]">
                            {day.items.length > 0 ? (
                              day.items.map(({ plan, schedule }) => {
                                const style = getStatusStyle(schedule.status);
                                return (
                                  <div
                                    key={schedule.id}
                                    className={cn(
                                      'relative rounded-lg p-2 border overflow-hidden',
                                      style.bg,
                                      style.border
                                    )}
                                  >
                                    {style.overlay && (
                                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)' }} />
                                    )}
                                    <div className="relative">
                                      <img
                                        src={plan.courseCover}
                                        alt={plan.courseTitle}
                                        className="w-full h-10 rounded object-cover mb-1.5"
                                      />
                                      <p className="text-white text-xs font-medium truncate">{plan.courseTitle}</p>
                                      <p className={cn(
                                        'text-[10px] mt-0.5',
                                        schedule.status === 'completed-on-time' ? 'text-mint-green' :
                                        schedule.status === 'completed-makeup' ? 'text-sky-400' :
                                        schedule.status === 'skipped' ? 'text-soft-yellow' :
                                        schedule.status === 'missed' ? 'text-red-400' :
                                        'text-text-muted'
                                      )}>
                                        {getStatusLabel(schedule.status)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="h-full flex items-center justify-center text-text-muted text-xs opacity-30 py-4">
                                —
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {memberPlans.length === 0 && (
                    <div className="tv-card text-center py-12 mt-6">
                      <Target className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
                      <p className="text-text-secondary">还没有训练计划</p>
                      <p className="text-text-muted text-sm mt-2">点击上方按钮添加本周训练计划</p>
                    </div>
                  )}
                </div>
              )}

              {/* 设置 */}
              {activeTab === 'settings' && (
                <div className="tv-card animate-fade-in">
                  <h3 className="text-xl font-bold text-white mb-6">个人设置</h3>
                  <div className="space-y-8">
                    {/* 健身目标 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-vibrant-orange" />
                        <label className="font-medium text-white">健身目标</label>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {goalOptions.map((goal) => (
                          <button
                            key={goal}
                            onClick={() => updateMember(selectedMember.id, { goal })}
                            className={cn(
                              'py-3 px-4 rounded-xl text-sm font-medium transition-all',
                              selectedMember.goal === goal
                                ? 'bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/30'
                                : 'bg-navy-medium text-text-secondary hover:bg-navy-light hover:text-white'
                            )}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 休息提醒 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-mint-green" />
                        <label className="font-medium text-white">休息提醒</label>
                        <span className="text-sm text-text-muted ml-auto">
                          每 {selectedMember.restReminder} 分钟提醒
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {restReminderOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              updateMember(selectedMember.id, { restReminder: option.value })
                            }
                            className={cn(
                              'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all',
                              selectedMember.restReminder === option.value
                                ? 'bg-mint-green/20 text-mint-green border border-mint-green/30'
                                : 'bg-navy-medium text-text-secondary hover:bg-navy-light hover:text-white'
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 添加计划弹窗 */}
        {showAddPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/80 backdrop-blur-sm">
            <div className="bg-navy-light rounded-3xl p-8 w-full max-w-lg animate-scale-in max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">添加训练计划</h2>
                <button
                  onClick={() => setShowAddPlanModal(false)}
                  className="w-10 h-10 rounded-full bg-navy-medium flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 选择课程 */}
                <div>
                  <label className="block text-text-secondary text-sm mb-3">选择课程</label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                    {getAddableCourses().map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setNewPlanCourseId(course.id)}
                        className={cn(
                          'p-3 rounded-xl text-left transition-all flex gap-3',
                          newPlanCourseId === course.id
                            ? 'bg-vibrant-orange/20 border border-vibrant-orange/30'
                            : 'bg-navy-medium hover:bg-navy-light'
                        )}
                      >
                        <img
                          src={course.cover}
                          alt={course.title}
                          className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{course.title}</p>
                          <p className="text-text-muted text-xs mt-0.5">{course.duration} 分钟</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 每周安排 */}
                <div>
                  <label className="block text-text-secondary text-sm mb-3">
                    每周安排
                    <span className="text-vibrant-orange ml-2">已选 {newPlanDaysOfWeek.length} 天</span>
                  </label>
                  <div className="flex gap-2">
                    {dayOptions.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDayOfWeek(day.value)}
                        className={cn(
                          'flex-1 py-3 rounded-xl font-medium transition-all text-sm',
                          newPlanDaysOfWeek.includes(day.value)
                            ? 'bg-vibrant-orange text-white'
                            : 'bg-navy-medium text-text-secondary hover:bg-navy-light hover:text-white'
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 提醒时间 */}
                <div>
                  <label className="block text-text-secondary text-sm mb-3">
                    提醒时间
                    <span className="text-text-muted ml-2">（可选）</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setNewPlanReminderTime('')}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        !newPlanReminderTime
                          ? 'bg-mint-green/20 text-mint-green border border-mint-green/30'
                          : 'bg-navy-medium text-text-secondary hover:bg-navy-light hover:text-white'
                      )}
                    >
                      不提醒
                    </button>
                    {reminderTimeOptions.map((time) => (
                      <button
                        key={time}
                        onClick={() => setNewPlanReminderTime(time)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                          newPlanReminderTime === time
                            ? 'bg-mint-green/20 text-mint-green border border-mint-green/30'
                            : 'bg-navy-medium text-text-secondary hover:bg-navy-light hover:text-white'
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 确认按钮 */}
                <button
                  onClick={handleAddPlan}
                  disabled={!newPlanCourseId || newPlanDaysOfWeek.length === 0}
                  className={cn(
                    'w-full py-4 rounded-xl font-bold text-lg transition-all',
                    newPlanCourseId && newPlanDaysOfWeek.length > 0
                      ? 'bg-vibrant-orange text-white hover:bg-orange-hover'
                      : 'bg-navy-medium text-text-muted cursor-not-allowed'
                  )}
                >
                  添加计划
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 成员列表视图
  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-16">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-vibrant-orange" />
            <div>
              <h1 className="text-3xl font-bold text-white">家庭成员</h1>
              <p className="text-text-secondary mt-1">
                共 {members.length} 位成员 · 当前：
                <span className="text-vibrant-orange">
                  {members.find((m) => m.id === currentMemberId)?.name}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="focusable flex items-center gap-2 px-6 py-3 bg-vibrant-orange text-white rounded-xl font-medium hover:bg-orange-hover transition-all"
          >
            <Plus className="w-5 h-5" />
            添加成员
          </button>
        </div>

        {/* 成员卡片网格 */}
        <div className="grid grid-cols-4 gap-6">
          {members.map((member, index) => {
            const streak = calculateStreakDays(member.id);
            return (
              <div
                key={member.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="animate-scale-in"
              >
                <div
                  onClick={() => handleSelectMember(member.id)}
                  className={cn(
                    'focusable tv-card cursor-pointer hover:shadow-glow transition-all',
                    currentMemberId === member.id && 'ring-2 ring-vibrant-orange shadow-glow'
                  )}
                >
                  <div className="text-center pb-4">
                    <div
                      className={cn(
                        'w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4',
                        member.isChild ? 'bg-soft-yellow/20' : 'bg-navy-medium'
                      )}
                    >
                      {member.avatar}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-sm text-text-secondary mb-4">{member.goal}</p>

                    {member.isChild && (
                      <span className="inline-block px-3 py-1 bg-soft-yellow/20 text-soft-yellow text-xs rounded-full mb-4">
                        儿童账户
                      </span>
                    )}

                    <div className="flex justify-center gap-6 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-xl font-bold text-vibrant-orange">{streak}</p>
                        <p className="text-xs text-text-secondary">连续天数</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-mint-green">{member.favorites.length}</p>
                        <p className="text-xs text-text-secondary">收藏</p>
                      </div>
                    </div>
                  </div>

                  {currentMemberId === member.id && (
                    <div className="text-center pt-3 border-t border-white/5">
                      <span className="inline-flex items-center gap-2 text-sm text-vibrant-orange">
                        <Check className="w-4 h-4" />
                        当前使用中
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 添加成员卡片 */}
          <div style={{ animationDelay: `${members.length * 0.1}s` }} className="animate-scale-in">
            <button
              onClick={() => setShowAddModal(true)}
              className="focusable w-full tv-card border-2 border-dashed border-white/20 hover:border-vibrant-orange/50 transition-all flex flex-col items-center justify-center py-12 min-h-[280px]"
            >
              <div className="w-16 h-16 rounded-full bg-navy-medium flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary font-medium">添加成员</p>
              <p className="text-sm text-text-muted mt-1">为家人创建独立账户</p>
            </button>
          </div>
        </div>

        {/* 儿童模式总开关 */}
        <div className="mt-12 tv-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">👶</span>
                儿童模式
              </h3>
              <p className="text-text-secondary mt-1">
                开启后只显示低强度、适合儿童的课程内容，保护孩子健康成长
              </p>
            </div>
            <button
              onClick={() => toggleChildMode()}
              className={cn(
                'w-16 h-9 rounded-full transition-all relative',
                childMode ? 'bg-soft-yellow' : 'bg-navy-medium'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-7 h-7 bg-white rounded-full transition-all',
                  childMode ? 'left-8' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 添加成员弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/80 backdrop-blur-sm">
          <div className="bg-navy-light rounded-3xl p-8 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">添加家庭成员</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-navy-medium flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 头像选择 */}
              <div>
                <label className="block text-text-secondary text-sm mb-3">选择头像</label>
                <div className="flex gap-3 flex-wrap">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewMemberAvatar(avatar)}
                      className={cn(
                        'w-14 h-14 rounded-full text-3xl flex items-center justify-center transition-all',
                        newMemberAvatar === avatar
                          ? 'bg-vibrant-orange/20 ring-2 ring-vibrant-orange'
                          : 'bg-navy-medium hover:bg-navy-light'
                      )}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* 昵称 */}
              <div>
                <label className="block text-text-secondary text-sm mb-2">昵称</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="输入成员昵称"
                  className="w-full px-4 py-3 bg-navy-medium border border-white/10 rounded-xl text-white placeholder-text-muted focus:border-vibrant-orange focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* 儿童账户 */}
              <div className="flex items-center justify-between py-4 px-4 bg-navy-medium/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">儿童账户</p>
                  <p className="text-sm text-text-secondary">适合 12 岁以下儿童使用</p>
                </div>
                <button
                  onClick={() => setNewMemberIsChild(!newMemberIsChild)}
                  className={cn(
                    'w-14 h-8 rounded-full transition-all relative',
                    newMemberIsChild ? 'bg-soft-yellow' : 'bg-deep-navy'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-1 w-6 h-6 bg-white rounded-full transition-all',
                      newMemberIsChild ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>

              {/* 确认按钮 */}
              <button
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-lg transition-all',
                  newMemberName.trim()
                    ? 'bg-vibrant-orange text-white hover:bg-orange-hover'
                    : 'bg-navy-medium text-text-muted cursor-not-allowed'
                )}
              >
                添加成员
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
