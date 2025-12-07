import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, LogOut, Cloud, CloudOff, RefreshCw, User } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';

export function SettingsPage() {
  const { transactions, loans, events, assets, isSyncing, lastSyncTime, saveToFirestore } = useApp();
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error) {
      setAuthError('로그인에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const handleManualSync = async () => {
    try {
      await saveToFirestore();
      alert('동기화가 완료되었습니다!');
    } catch (error) {
      alert('동기화에 실패했습니다.');
      console.error(error);
    }
  };

  const handleExport = () => {
    const data = {
      transactions,
      loans,
      events,
      assets,
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
          if (data.transactions || data.loans || data.events || data.assets) {
            const now = new Date();
            localStorage.setItem(
              'finance-timeline-data',
              JSON.stringify({
                transactions: data.transactions || [],
                loans: data.loans || [],
                events: data.events || [],
                assets: data.assets || [],
                currentYear: now.getFullYear(),
                currentMonth: now.getMonth() + 1,
              })
            );
            alert('데이터를 성공적으로 가져왔습니다.');
            window.location.reload();
          } else {
            alert('유효한 데이터가 없습니다.');
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
    loansCount: loans.length,
    eventsCount: events.length,
    assetsCount: assets.length,
  };

  const formatSyncTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl space-y-4 lg:space-y-6">
      {/* 계정 연동 */}
      <div className="card !p-4 lg:!p-6">
        <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">계정 연동</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-dark-400 animate-spin" />
          </div>
        ) : user ? (
          <div className="space-y-3 lg:space-y-4">
            {/* 사용자 정보 */}
            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-dark-800/50 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="프로필"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 lg:w-6 lg:h-6 text-violet-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-100 text-sm lg:text-base truncate">{user.displayName}</p>
                <p className="text-xs lg:text-sm text-dark-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs lg:text-sm py-1.5 lg:py-2 px-2 lg:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>

            {/* 동기화 상태 */}
            <div className="flex items-center justify-between p-3 lg:p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2 lg:gap-3">
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                )}
                <div>
                  <p className="text-sm lg:text-base font-medium text-emerald-400">
                    {isSyncing ? '동기화 중...' : '클라우드 연결됨'}
                  </p>
                  {lastSyncTime && (
                    <p className="text-xs text-dark-400">
                      마지막 동기화: {formatSyncTime(lastSyncTime)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="btn bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs lg:text-sm py-1.5 lg:py-2 px-2 lg:px-3"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">수동 동기화</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center gap-3 p-3 lg:p-4 bg-dark-800/50 rounded-xl">
              <CloudOff className="w-5 h-5 text-dark-400" />
              <div className="flex-1">
                <p className="text-sm lg:text-base font-medium text-dark-200">오프라인 모드</p>
                <p className="text-xs lg:text-sm text-dark-400">
                  Google 계정으로 로그인하면 여러 기기에서 데이터를 동기화할 수 있습니다
                </p>
              </div>
            </div>

            {authError && (
              <p className="text-sm text-rose-400 px-1">{authError}</p>
            )}

            <button
              onClick={handleSignIn}
              className="w-full btn bg-white hover:bg-gray-100 text-gray-800 py-2.5 lg:py-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google 계정으로 로그인
            </button>
          </div>
        )}
      </div>

      {/* 데이터 관리 */}
      <div className="card !p-4 lg:!p-6">
        <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">데이터 관리</h3>
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between p-3 lg:p-4 bg-dark-800/50 rounded-xl gap-3">
            <div className="min-w-0">
              <h4 className="font-medium text-dark-100 text-sm lg:text-base">데이터 내보내기</h4>
              <p className="text-xs lg:text-sm text-dark-400">
                모든 데이터를 JSON 파일로 저장
              </p>
            </div>
            <button onClick={handleExport} className="btn btn-secondary text-xs lg:text-sm py-1.5 lg:py-2 px-2 lg:px-3 flex-shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">내보내기</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 lg:p-4 bg-dark-800/50 rounded-xl gap-3">
            <div className="min-w-0">
              <h4 className="font-medium text-dark-100 text-sm lg:text-base">데이터 가져오기</h4>
              <p className="text-xs lg:text-sm text-dark-400">
                백업 파일에서 데이터 복원
              </p>
            </div>
            <button onClick={handleImport} className="btn btn-secondary text-xs lg:text-sm py-1.5 lg:py-2 px-2 lg:px-3 flex-shrink-0">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">가져오기</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 lg:p-4 bg-dark-800/50 rounded-xl border border-rose-500/20 gap-3">
            <div className="min-w-0">
              <h4 className="font-medium text-dark-100 text-sm lg:text-base">데이터 초기화</h4>
              <p className="text-xs lg:text-sm text-dark-400">
                모든 데이터 삭제
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs lg:text-sm py-1.5 lg:py-2 px-2 lg:px-3 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card !p-4 lg:!p-6">
        <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">통계</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">전체 거래</p>
            <p className="text-lg lg:text-2xl font-bold text-dark-100">{stats.totalTransactions}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">수입 항목</p>
            <p className="text-lg lg:text-2xl font-bold text-emerald-400">{stats.incomeCount}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">지출 항목</p>
            <p className="text-lg lg:text-2xl font-bold text-rose-400">{stats.expenseCount}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">반복 거래</p>
            <p className="text-lg lg:text-2xl font-bold text-blue-400">{stats.recurringCount}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">대출</p>
            <p className="text-lg lg:text-2xl font-bold text-amber-400">{stats.loansCount}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">이벤트</p>
            <p className="text-lg lg:text-2xl font-bold text-purple-400">{stats.eventsCount}건</p>
          </div>
          <div className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs lg:text-sm text-dark-400">자산</p>
            <p className="text-lg lg:text-2xl font-bold text-teal-400">{stats.assetsCount}건</p>
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
