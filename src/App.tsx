import { useState } from 'react';
import { AppProvider } from './store/AppContext';
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

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 min-h-screen">
        <Header
          title={PAGE_TITLES[activeTab]}
          onAddClick={showAddButton ? () => setShowAddForm(true) : undefined}
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
