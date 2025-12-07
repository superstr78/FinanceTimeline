import { Home, Menu, Loader2, Cloud } from 'lucide-react';

interface HeaderProps {
  title: string;
  onTodayClick?: () => void;
  showTodayButton?: boolean;
  onMenuClick: () => void;
  isSyncing?: boolean;
  isLoggedIn?: boolean;
  lastSyncTime?: Date | null;
}

export function Header({
  title,
  onTodayClick,
  showTodayButton,
  onMenuClick,
  isSyncing,
  isLoggedIn,
  lastSyncTime
}: HeaderProps) {
  const formatLastSyncTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

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

      {/* 동기화 상태 (로그인 상태에서만 표시) */}
      {isLoggedIn && (
        <div className="flex flex-col items-end text-xs px-2 lg:px-3 py-1">
          <div className="flex items-center gap-1.5">
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-blue-400">저장 중...</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">자동 저장</span>
              </>
            )}
          </div>
          {lastSyncTime && !isSyncing && (
            <span className="text-[10px] text-dark-500 mt-0.5">
              {formatLastSyncTime(lastSyncTime)}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
