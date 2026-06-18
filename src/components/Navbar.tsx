import { Link, useLocation } from 'react-router-dom';
import { Home, Users, History, Dumbbell } from 'lucide-react';
import { useMemberStore } from '@/stores/useMemberStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const location = useLocation();
  const { getCurrentMember, childMode } = useMemberStore();
  const currentMember = getCurrentMember();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/family', label: '家庭成员', icon: Users },
    { path: '/history', label: '历史记录', icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-white/5 backdrop-blur-md">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 focusable rounded-lg px-3 py-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vibrant-orange to-orange-hover flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FitTV</h1>
              <p className="text-xs text-text-secondary">客厅健身</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'focusable flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200',
                  isActive(item.path)
                    ? 'bg-vibrant-orange/20 text-vibrant-orange'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {childMode && (
              <span className="px-4 py-2 bg-soft-yellow/20 text-soft-yellow rounded-full text-sm font-medium">
                👶 儿童模式
              </span>
            )}
            <Link
              to="/family"
              className="focusable flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-navy-medium flex items-center justify-center text-2xl">
                {currentMember?.avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{currentMember?.name}</p>
                <p className="text-xs text-text-secondary">
                  连续 {currentMember?.streakDays} 天
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
