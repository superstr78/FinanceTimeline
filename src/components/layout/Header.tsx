import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  onAddClick?: () => void;
}

export function Header({ title, onAddClick }: HeaderProps) {
  return (
    <header className="h-16 bg-dark-900/30 backdrop-blur-sm border-b border-dark-800 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-100">{title}</h2>
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
