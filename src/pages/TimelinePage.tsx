import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, CalendarDays, Flag } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { MonthBlock } from '../components/timeline/MonthBlock';
import { YearBlock } from '../components/timeline/YearBlock';
import { TransactionForm } from '../components/timeline/TransactionForm';
import { EventForm } from '../components/events/EventForm';
import type { Transaction, LifeEvent } from '../types';

type ViewMode = 'month' | 'year';

export function TimelinePage() {
  const { currentYear, currentMonth } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // 무한 스크롤을 위한 상태
  const [monthsToShow, setMonthsToShow] = useState(6);
  const [yearsToShow, setYearsToShow] = useState(3);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEditEvent = (event: LifeEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // 무한 스크롤 감지
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      if (viewMode === 'month') {
        setMonthsToShow((prev) => prev + 6);
      } else {
        setYearsToShow((prev) => prev + 2);
      }
    }
  }, [viewMode]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [handleObserver]);

  // 뷰 모드 변경 시 초기화
  useEffect(() => {
    setMonthsToShow(6);
    setYearsToShow(3);
  }, [viewMode]);

  // 월별 뷰 데이터 생성
  const getMonths = () => {
    const months: { year: number; month: number }[] = [];
    let y = currentYear;
    let m = currentMonth;
    for (let i = 0; i < monthsToShow; i++) {
      months.push({ year: y, month: m });
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    return months;
  };

  // 연도별 뷰 데이터 생성
  const getYears = () => {
    const years: number[] = [];
    for (let i = 0; i < yearsToShow; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  return (
    <div className="space-y-4">
      {/* 뷰 모드 토글 및 이벤트 추가 */}
      <div className="flex items-center justify-between gap-2 sticky top-0 z-20 bg-dark-950 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`btn ${
              viewMode === 'month'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'btn-secondary'
            }`}
          >
            <Calendar className="w-4 h-4" />
            월별 보기
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`btn ${
              viewMode === 'year'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'btn-secondary'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            연도별 보기
          </button>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="btn bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30"
        >
          <Flag className="w-4 h-4" />
          이벤트 추가
        </button>
      </div>

      {/* 타임라인 컨텐츠 */}
      <div className="space-y-8">
        {viewMode === 'month' ? (
          // 월별 뷰
          getMonths().map(({ year, month }) => (
            <MonthBlock
              key={`${year}-${month}`}
              year={year}
              month={month}
              onEdit={handleEdit}
              onEditEvent={handleEditEvent}
            />
          ))
        ) : (
          // 연도별 뷰
          getYears().map((year) => (
            <YearBlock
              key={year}
              year={year}
              onEdit={handleEdit}
              onEditEvent={handleEditEvent}
            />
          ))
        )}

        {/* 무한 스크롤 로더 */}
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="text-dark-500 text-sm">
            스크롤하여 더 보기...
          </div>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
        />
      )}

      {showEventForm && (
        <EventForm
          event={editingEvent}
          onClose={handleCloseEventForm}
        />
      )}
    </div>
  );
}
