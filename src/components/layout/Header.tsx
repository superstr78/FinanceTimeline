import { Home, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onTodayClick?: () => void;
  showTodayButton?: boolean;
  onMenuClick: () => void;
}

export function Header({ title, onTodayClick, showTodayButton, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 lg:h-16 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800 flex items-center px-4 lg:px-6">
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 mr-2 text-dark-400 hover:text-dark-100"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-2 lg:gap-3 flex-1">
        <h2 className="text-lg lg:text-xl font-semibold text-dark-100 truncate">{title}</h2>
        {showTodayButton && onTodayClick && (
          <button
            onClick={onTodayClick}
            className="btn bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30 text-xs lg:text-sm py-1 lg:py-1.5 px-2 lg:px-3"
          >
            <Home className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">오늘</span>
          </button>
        )}
      </div>
    </header>
  );
}
