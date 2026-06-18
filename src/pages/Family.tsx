import { useState } from 'react';
import { Users, Plus, Star, Bell, Target, Check, ChevronRight, X } from 'lucide-react';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCourseStore } from '@/stores/useCourseStore';
import { cn, formatDate } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'settings'>('info');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState(avatarOptions[0]);
  const [newMemberIsChild, setNewMemberIsChild] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  useKeyboardNavigation({
    onBack: () => {
      if (showAddModal) {
        setShowAddModal(false);
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

  const getFavoriteCourses = (favorites: string[]) => {
    return courses.filter((c) => favorites.includes(c.id));
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
                    <p className="text-3xl font-bold text-vibrant-orange">{selectedMember.streakDays}</p>
                    <p className="text-sm text-text-secondary">连续天数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-mint-green">{favoriteCourses.length}</p>
                    <p className="text-sm text-text-secondary">收藏课程</p>
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
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'info', label: '基本信息', icon: Users },
                  { id: 'favorites', label: '收藏课程', icon: Star },
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
          {members.map((member, index) => (
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
                      <p className="text-xl font-bold text-vibrant-orange">{member.streakDays}</p>
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
          ))}

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
