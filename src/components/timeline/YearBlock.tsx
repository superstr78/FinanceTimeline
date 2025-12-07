import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Star, Flag } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  EVENT_COLOR_CLASSES,
  EVENT_CATEGORY_LABELS,
  EVENT_BG_CLASSES,
  type Transaction,
  type LifeEvent,
} from '../../types';

interface YearBlockProps {
  year: number;
  onEdit: (transaction: Transaction) => void;
  onEditEvent?: (event: LifeEvent) => void;
}

export function YearBlock({ year, onEdit, onEditEvent }: YearBlockProps) {
  const { getMultiMonthSummaries, getTransactionsForMonth, getEventsForMonth, events } = useApp();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  // 해당 연도 12개월 요약
  const monthlySummaries = useMemo(
    () => getMultiMonthSummaries(year, 1, 12),
    [getMultiMonthSummaries, year]
  );

  // 연간 합계
  const yearTotal = useMemo(() => {
    return monthlySummaries.reduce(
      (acc, s) => ({
        income: acc.income + s.totalIncome,
        expense: acc.expense + s.totalExpense,
        balance: acc.balance + s.balance,
      }),
      { income: 0, expense: 0, balance: 0 }
    );
  }, [monthlySummaries]);

  // 해당 연도의 이벤트 수
  const yearEvents = useMemo(() => {
    return events.filter((e) => {
      const eventYear = new Date(e.date).getFullYear();
      return eventYear === year;
    });
  }, [events, year]);

  // 월별 이벤트 수 계산
  const getEventCountForMonth = (month: number) => {
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    }).length;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    return formatAmount(amount);
  };

  const toggleMonth = (month: number) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  return (
    <div className="card">
      {/* 연도 헤더 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-dark-100">{year}년</h2>
          {yearEvents.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400">
              <Flag className="w-3 h-3" />
              {yearEvents.length}개 이벤트
            </span>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-dark-400">수입</span>
            <span className="font-semibold text-emerald-400">
              +{formatAmount(yearTotal.income)}원
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-dark-400">지출</span>
            <span className="font-semibold text-rose-400">
              -{formatAmount(yearTotal.expense)}원
            </span>
          </div>
          <div className={`font-bold text-lg ${yearTotal.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {yearTotal.balance >= 0 ? '+' : ''}{formatAmount(yearTotal.balance)}원
          </div>
        </div>
      </div>

      {/* 월별 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {monthlySummaries.map((summary) => {
          const isExpanded = expandedMonth === summary.month;
          const transactions = isExpanded ? getTransactionsForMonth(year, summary.month) : [];
          const monthEvents = isExpanded ? getEventsForMonth(year, summary.month) : [];
          const eventCount = getEventCountForMonth(summary.month);
          const hasData = summary.totalIncome > 0 || summary.totalExpense > 0 || eventCount > 0;

          return (
            <div
              key={summary.month}
              className={`rounded-xl border transition-all ${
                hasData
                  ? 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                  : 'bg-dark-900/30 border-dark-800/50'
              }`}
            >
              {/* 월 헤더 */}
              <button
                onClick={() => hasData && toggleMonth(summary.month)}
                className={`w-full p-4 text-left ${hasData ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={!hasData}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-dark-100">
                      {summary.month}월
                    </span>
                    {eventCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-xs text-purple-400">
                        <Flag className="w-2.5 h-2.5" />
                        {eventCount}
                      </span>
                    )}
                  </div>
                  {hasData && (
                    isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-dark-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-dark-400" />
                    )
                  )}
                </div>

                {summary.totalIncome > 0 || summary.totalExpense > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">수입</span>
                      <span className="text-emerald-400">+{formatCompact(summary.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">지출</span>
                      <span className="text-rose-400">-{formatCompact(summary.totalExpense)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-1 border-t border-dark-700">
                      <span className="text-dark-400">잔액</span>
                      <span className={summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {summary.balance >= 0 ? '+' : ''}{formatCompact(summary.balance)}
                      </span>
                    </div>
                  </div>
                ) : eventCount > 0 ? (
                  <p className="text-sm text-purple-400">이벤트만 있음</p>
                ) : (
                  <p className="text-sm text-dark-600">거래 없음</p>
                )}
              </button>

              {/* 확장된 거래 및 이벤트 목록 */}
              {isExpanded && (transactions.length > 0 || monthEvents.length > 0) && (
                <div className="border-t border-dark-700 p-3 space-y-2 max-h-60 overflow-y-auto">
                  {/* 이벤트 */}
                  {monthEvents.map((ev) => (
                    <button
                      key={`e-${ev.id}`}
                      onClick={() => onEditEvent?.(ev)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${EVENT_BG_CLASSES[ev.color]}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ev.isImportant ? (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${EVENT_COLOR_CLASSES[ev.color]}`} />
                        )}
                        <span className="text-sm text-dark-200 truncate">{ev.title}</span>
                        <span className="text-xs text-dark-500 flex-shrink-0">
                          {new Date(ev.date).getDate()}일
                        </span>
                      </div>
                      <span className="text-xs text-dark-400 whitespace-nowrap ml-2">
                        {EVENT_CATEGORY_LABELS[ev.category]}
                      </span>
                    </button>
                  ))}
                  {/* 거래 */}
                  {transactions.map((t) => (
                    <button
                      key={`${t.id}-${t.date}`}
                      onClick={() => onEdit(t)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-dark-900/50 hover:bg-dark-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-sm text-dark-200 truncate">{t.title}</span>
                      </div>
                      <span className={`text-sm font-medium whitespace-nowrap ml-2 ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCompact(t.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 월별 바 차트 */}
      <div className="mt-6 pt-4 border-t border-dark-800">
        <h4 className="text-sm font-medium text-dark-400 mb-3">월별 현황</h4>
        <div className="flex items-end gap-1 h-24">
          {monthlySummaries.map((summary) => {
            const maxAmount = Math.max(
              ...monthlySummaries.map((s) => Math.max(s.totalIncome, s.totalExpense))
            );
            const incomeHeight = maxAmount > 0 ? (summary.totalIncome / maxAmount) * 100 : 0;
            const expenseHeight = maxAmount > 0 ? (summary.totalExpense / maxAmount) * 100 : 0;

            return (
              <div key={summary.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end h-20">
                  <div
                    className="flex-1 bg-emerald-500/60 rounded-t transition-all"
                    style={{ height: `${incomeHeight}%`, minHeight: summary.totalIncome > 0 ? '2px' : '0' }}
                  />
                  <div
                    className="flex-1 bg-rose-500/60 rounded-t transition-all"
                    style={{ height: `${expenseHeight}%`, minHeight: summary.totalExpense > 0 ? '2px' : '0' }}
                  />
                </div>
                <span className="text-xs text-dark-500">{summary.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/60" />
            <span className="text-xs text-dark-500">수입</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-500/60" />
            <span className="text-xs text-dark-500">지출</span>
          </div>
        </div>
      </div>
    </div>
  );
}
