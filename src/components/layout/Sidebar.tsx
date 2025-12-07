import {
  LayoutDashboard,
  Calendar,
  Settings,
  Banknote,
  Landmark,
  Receipt,
  Flag,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'timeline', icon: Calendar, label: '타임라인' },
  { id: 'transactions', icon: Receipt, label: '수입/지출' },
  { id: 'events', icon: Flag, label: '이벤트' },
  { id: 'loans', icon: Landmark, label: '대출 관리' },
  { id: 'summary', icon: LayoutDashboard, label: '요약' },
  { id: 'settings', icon: Settings, label: '설정' },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    onClose(); // 모바일에서 메뉴 선택 시 닫기
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 lg:p-6 border-b border-dark-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-dark-100">재정 타임라인</h1>
                <p className="text-xs text-dark-500">Finance Timeline</p>
              </div>
            </div>
            {/* 모바일 닫기 버튼 */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-dark-400 hover:text-dark-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
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

        <div className="p-3 lg:p-4 border-t border-dark-800 hidden lg:block">
          <div className="card !p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <p className="text-sm text-dark-300">
              재정을 계획하고 미래를 준비하세요
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
