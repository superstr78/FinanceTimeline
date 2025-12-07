import { useState } from 'react';
import { AuthProvider } from './store/AuthContext';
import { AppProvider, useApp } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TimelinePage } from './pages/TimelinePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { EventsPage } from './pages/EventsPage';
import { LoansPage } from './pages/LoansPage';
import { SummaryPage } from './pages/SummaryPage';
import { SettingsPage } from './pages/SettingsPage';

const PAGE_TITLES: Record<string, string> = {
  timeline: '타임라인',
  transactions: '수입/지출 관리',
  events: '이벤트 관리',
  loans: '대출 관리',
  summary: '요약',
  settings: '설정',
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

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
