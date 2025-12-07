import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function SettingsPage() {
  const { transactions } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = {
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.transactions) {
            const now = new Date();
            localStorage.setItem(
              'finance-timeline-data',
              JSON.stringify({
                transactions: data.transactions,
                currentYear: now.getFullYear(),
                currentMonth: now.getMonth() + 1,
              })
            );
            window.location.reload();
          }
        } catch {
          alert('유효하지 않은 파일입니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    localStorage.removeItem('finance-timeline-data');
    window.location.reload();
  };

  // 통계
  const stats = {
    totalTransactions: transactions.length,
    incomeCount: transactions.filter((t) => t.type === 'income').length,
    expenseCount: transactions.filter((t) => t.type === 'expense').length,
    recurringCount: transactions.filter((t) => t.recurrence !== 'once').length,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">데이터 관리</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
            <div>
              <h4 className="font-medium text-dark-100">데이터 내보내기</h4>
              <p className="text-sm text-dark-400">
                모든 거래 내역을 JSON 파일로 저장합니다
              </p>
            </div>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              내보내기
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
            <div>
              <h4 className="font-medium text-dark-100">데이터 가져오기</h4>
              <p className="text-sm text-dark-400">
                백업 파일에서 데이터를 복원합니다
              </p>
            </div>
            <button onClick={handleImport} className="btn btn-secondary">
              <Upload className="w-4 h-4" />
              가져오기
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-rose-500/20">
            <div>
              <h4 className="font-medium text-dark-100">데이터 초기화</h4>
              <p className="text-sm text-dark-400">
                모든 데이터를 삭제하고 초기 상태로 되돌립니다
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
            >
              <Trash2 className="w-4 h-4" />
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">통계</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-dark-800/50 rounded-xl">
            <p className="text-sm text-dark-400">전체 거래</p>
            <p className="text-2xl font-bold text-dark-100">{stats.totalTransactions}건</p>
          </div>
          <div className="p-4 bg-dark-800/50 rounded-xl">
            <p className="text-sm text-dark-400">수입 항목</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.incomeCount}건</p>
          </div>
          <div className="p-4 bg-dark-800/50 rounded-xl">
            <p className="text-sm text-dark-400">지출 항목</p>
            <p className="text-2xl font-bold text-rose-400">{stats.expenseCount}건</p>
          </div>
          <div className="p-4 bg-dark-800/50 rounded-xl">
            <p className="text-sm text-dark-400">반복 거래</p>
            <p className="text-2xl font-bold text-blue-400">{stats.recurringCount}건</p>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-dark-100 mb-2">
              정말 초기화하시겠습니까?
            </h3>
            <p className="text-dark-400 mb-6">
              모든 거래 내역이 영구적으로 삭제됩니다.
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="btn bg-rose-500 hover:bg-rose-600 text-white flex-1"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
