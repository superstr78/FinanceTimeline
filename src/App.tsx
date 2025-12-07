import { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TimelinePage } from './pages/TimelinePage';
import { LoansPage } from './pages/LoansPage';
import { SummaryPage } from './pages/SummaryPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionForm } from './components/timeline/TransactionForm';

const PAGE_TITLES: Record<string, string> = {
  timeline: '타임라인',
  loans: '대출 관리',
  summary: '요약',
  settings: '설정',
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [showAddForm, setShowAddForm] = useState(false);
  const { currentYear, currentMonth, setCurrentDate } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'timeline':
        return <TimelinePage />;
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

  // 거래 추가 버튼은 타임라인과 요약 페이지에서만 표시
  const showAddButton = activeTab === 'timeline' || activeTab === 'summary';

  // 현재 날짜가 오늘인지 확인 (타임라인에서만 사용)
  const isToday = () => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
  };

  // 오늘로 이동
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now.getFullYear(), now.getMonth() + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 타임라인 탭에서만 '오늘' 버튼 표시
  const showTodayButton = activeTab === 'timeline' && !isToday();

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 min-h-screen">
        <Header
          title={PAGE_TITLES[activeTab]}
          onAddClick={showAddButton ? () => setShowAddForm(true) : undefined}
          onTodayClick={handleToday}
          showTodayButton={showTodayButton}
        />
        <div className="p-6">{renderPage()}</div>
      </main>

      {showAddForm && (
        <TransactionForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
