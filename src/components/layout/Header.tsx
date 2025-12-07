import { Plus, Home } from 'lucide-react';

interface HeaderProps {
  title: string;
  onAddClick?: () => void;
  onTodayClick?: () => void;
  showTodayButton?: boolean;
}

export function Header({ title, onAddClick, onTodayClick, showTodayButton }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-dark-100">{title}</h2>
        {showTodayButton && onTodayClick && (
          <button
            onClick={onTodayClick}
            className="btn bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30 text-sm py-1.5 px-3"
          >
            <Home className="w-4 h-4" />
            오늘
          </button>
        )}
      </div>

      {onAddClick && (
        <button onClick={onAddClick} className="btn bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-5 h-5" />
          거래 추가
        </button>
      )}
    </header>
  );
}
