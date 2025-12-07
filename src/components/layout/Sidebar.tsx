import {
  LayoutDashboard,
  Calendar,
  Settings,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'timeline', icon: Calendar, label: '타임라인' },
  { id: 'loans', icon: Landmark, label: '대출 관리' },
  { id: 'summary', icon: LayoutDashboard, label: '요약' },
  { id: 'settings', icon: Settings, label: '설정' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { currentYear, currentMonth, setCurrentDate } = useApp();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentDate(currentYear - 1, 12);
    } else {
      setCurrentDate(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentDate(currentYear + 1, 1);
    } else {
      setCurrentDate(currentYear, currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900/50 backdrop-blur-xl border-r border-dark-800 flex flex-col z-50">
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-dark-100">재정 타임라인</h1>
            <p className="text-xs text-dark-500">Finance Timeline</p>
          </div>
        </div>
      </div>

      {/* 월 네비게이션 */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center justify-between mb-3">
          <button onClick={handlePrevMonth} className="btn btn-ghost p-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-lg font-bold text-dark-100">
              {currentYear}년 {currentMonth}월
            </span>
          </div>
          <button onClick={handleNextMonth} className="btn btn-ghost p-2">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleToday}
          className="w-full btn btn-secondary text-sm"
        >
          오늘로 이동
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="card !p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <p className="text-sm text-dark-300">
            재정을 계획하고 미래를 준비하세요
          </p>
        </div>
      </div>
    </aside>
  );
}
