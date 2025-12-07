import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AppProvider, useApp } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TimelinePage } from './pages/TimelinePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { EventsPage } from './pages/EventsPage';
import { LoansPage } from './pages/LoansPage';
import { SummaryPage } from './pages/SummaryPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

const OFFLINE_MODE_KEY = 'plan-my-life-offline-mode';

const PAGE_TITLES: Record<string, string> = {
  timeline: '타임라인',
  transactions: '수입/지출 관리',
  events: '이벤트 관리',
  loans: '대출 관리',
  summary: '요약',
  settings: '설정',
  help: '도움말',
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setCurrentDate } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'timeline':
        return <TimelinePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'events':
        return <EventsPage />;
      case 'loans':
        return <LoansPage />;
      case 'summary':
        return <SummaryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <TimelinePage />;
    }
  };

  // 오늘로 이동
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now.getFullYear(), now.getMonth() + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 타임라인 탭에서는 항상 '오늘' 버튼 표시
  const showTodayButton = activeTab === 'timeline';

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="lg:ml-64 min-h-screen">
        <Header
          title={PAGE_TITLES[activeTab]}
          onTodayClick={handleToday}
          showTodayButton={showTodayButton}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="p-4 lg:p-6">{renderPage()}</div>
      </main>
    </div>
  );
}

function AppWithAuth() {
  const { user, loading } = useAuth();
  const [offlineMode, setOfflineMode] = useState<boolean | null>(null);

  useEffect(() => {
    // localStorage에서 오프라인 모드 설정 확인
    const stored = localStorage.getItem(OFFLINE_MODE_KEY);
    setOfflineMode(stored === 'true');
  }, []);

  const handleContinueOffline = () => {
    localStorage.setItem(OFFLINE_MODE_KEY, 'true');
    setOfflineMode(true);
  };

  // 로딩 중
  if (loading || offlineMode === null) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인 안 되어 있고, 오프라인 모드도 선택 안 한 경우 → 웰컴 화면
  if (!user && !offlineMode) {
    return <WelcomeScreen onContinueOffline={handleContinueOffline} />;
  }

  // 로그인 됐거나 오프라인 모드 선택한 경우 → 메인 앱
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
