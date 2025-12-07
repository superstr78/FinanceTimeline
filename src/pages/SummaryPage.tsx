import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wallet, Flag, Target } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function SummaryPage() {
  const { currentYear, currentMonth, getMultiMonthSummaries, transactions, events } = useApp();

  // 장기 지출 전망 계산 (5년 단위로 30년까지)
  const longTermExpenses = useMemo(() => {
    const periods = [5, 10, 15, 20, 25, 30];
    const results: { years: number; totalExpense: number; totalIncome: number; balance: number }[] = [];

    periods.forEach((years) => {
      // 현재 월부터 해당 년수만큼의 월 수 계산
      const totalMonths = years * 12;
      let totalExpense = 0;
      let totalIncome = 0;

      let year = currentYear;
      let month = currentMonth;

      for (let i = 0; i < totalMonths; i++) {
        const summary = getMultiMonthSummaries(year, month, 1)[0];
        if (summary) {
          totalExpense += summary.totalExpense;
          totalIncome += summary.totalIncome;
        }

        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }

      results.push({
        years,
        totalExpense,
        totalIncome,
        balance: totalIncome - totalExpense,
      });
    });

    return results;
  }, [currentYear, currentMonth, getMultiMonthSummaries]);

  // 무한 스크롤을 위한 상태
  const [yearsToShow, setYearsToShow] = useState(3);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 감지
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setYearsToShow((prev) => prev + 2);
    }
  }, []);

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

  // 표시할 연도 목록 생성
  const getYears = () => {
    const years: number[] = [];
    for (let i = 0; i < yearsToShow; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const categoryLabels: Record<string, string> = {
    salary: '월급',
    bonus: '보너스',
    other_income: '기타 수입',
    rent: '월세/주거비',
    insurance: '보험',
    subscription: '구독료',
    utilities: '공과금',
    transport: '교통비',
    food: '식비',
    shopping: '쇼핑',
    travel: '여행',
    education: '교육',
    medical: '의료',
    other_expense: '기타 지출',
  };

  // 금액을 억/만 단위로 포맷팅
  const formatCompactAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}천만`;
    }
    if (amount >= 10000) {
      return `${Math.round(amount / 10000)}만`;
    }
    return formatAmount(amount);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 장기 재정 전망 */}
      <div className="card !p-4 lg:!p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-dark-100">장기 재정 전망</h2>
            <p className="text-xs lg:text-sm text-dark-400">
              {currentYear}년 {currentMonth}월부터 예상 총액
            </p>
          </div>
        </div>

        {/* 지출 전망 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {longTermExpenses.map((item) => (
            <div
              key={item.years}
              className="p-3 lg:p-4 bg-dark-800/50 rounded-xl border border-dark-700"
            >
              <div className="text-center">
                <p className="text-xs lg:text-sm text-violet-400 font-medium mb-1">
                  {item.years}년 후
                </p>
                <p className="text-[10px] lg:text-xs text-dark-500 mb-2">
                  ~{currentYear + item.years}년
                </p>
                <div className="space-y-1">
                  <div>
                    <p className="text-[10px] text-dark-500">총 지출</p>
                    <p className="text-sm lg:text-base font-bold text-rose-400">
                      {formatCompactAmount(item.totalExpense)}
                    </p>
                  </div>
                  <div className="border-t border-dark-700 pt-1">
                    <p className="text-[10px] text-dark-500">총 수입</p>
                    <p className="text-xs lg:text-sm font-medium text-emerald-400">
                      {formatCompactAmount(item.totalIncome)}
                    </p>
                  </div>
                  <div className="border-t border-dark-700 pt-1">
                    <p className="text-[10px] text-dark-500">순수익</p>
                    <p className={`text-xs lg:text-sm font-medium ${item.balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      {item.balance >= 0 ? '+' : ''}{formatCompactAmount(item.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="text-[10px] lg:text-xs text-dark-500 mt-3 text-center">
          * 현재 등록된 반복 거래와 대출 상환 계획을 기반으로 계산됩니다
        </p>
      </div>

      {/* 연도별 요약 */}
      {getYears().map((year) => (
        <YearSummaryBlock
          key={year}
          year={year}
          getMultiMonthSummaries={getMultiMonthSummaries}
          transactions={transactions}
          events={events}
          formatAmount={formatAmount}
          categoryLabels={categoryLabels}
        />
      ))}

      {/* 무한 스크롤 로더 */}
      <div ref={loaderRef} className="flex justify-center py-8">
        <div className="text-dark-500 text-sm">
          스크롤하여 더 보기...
        </div>
      </div>
    </div>
  );
}

// 연도별 요약 블록 컴포넌트
interface YearSummaryBlockProps {
  year: number;
  getMultiMonthSummaries: (year: number, startMonth: number, count: number) => { year: number; month: number; totalIncome: number; totalExpense: number; balance: number }[];
  transactions: { type: string; category: string; amount: number; recurrence: string }[];
  events: { date: string }[];
  formatAmount: (amount: number) => string;
  categoryLabels: Record<string, string>;
}

function YearSummaryBlock({
  year,
  getMultiMonthSummaries,
  transactions,
  events,
  formatAmount,
  categoryLabels
}: YearSummaryBlockProps) {
  // 해당 연도의 12개월 요약
  const yearSummaries = useMemo(
    () => getMultiMonthSummaries(year, 1, 12),
    [getMultiMonthSummaries, year]
  );

  // 연간 합계
  const yearTotal = useMemo(() => {
    return yearSummaries.reduce(
      (acc, s) => ({
        income: acc.income + s.totalIncome,
        expense: acc.expense + s.totalExpense,
        balance: acc.balance + s.balance,
      }),
      { income: 0, expense: 0, balance: 0 }
    );
  }, [yearSummaries]);

  // 해당 연도 이벤트 수
  const yearEventCount = useMemo(() => {
    return events.filter((e) => {
      const eventYear = new Date(e.date).getFullYear();
      return eventYear === year;
    }).length;
  }, [events, year]);

  // 카테고리별 지출 집계 (해당 연도)
  const expenseByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        let amount = t.amount;
        if (t.recurrence === 'monthly') {
          amount *= 12;
        }
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      });
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  const hasData = yearTotal.income > 0 || yearTotal.expense > 0 || yearEventCount > 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 연도 헤더 */}
      <div className="flex items-center gap-2 lg:gap-3 pb-2 border-b border-dark-800">
        <h2 className="text-xl lg:text-2xl font-bold text-dark-100">{year}년 요약</h2>
        {yearEventCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full text-[10px] lg:text-xs text-purple-400">
            <Flag className="w-3 h-3" />
            {yearEventCount}
          </span>
        )}
      </div>

      {hasData ? (
        <>
          {/* 연간 요약 카드 */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <div className="card !p-3 lg:!p-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                </div>
                <span className="text-dark-400 text-xs lg:text-base hidden sm:inline">연간 총 수입</span>
                <span className="text-dark-400 text-xs sm:hidden">수입</span>
              </div>
              <p className="text-sm lg:text-2xl font-bold text-emerald-400 truncate">
                +{formatAmount(yearTotal.income)}
              </p>
            </div>

            <div className="card !p-3 lg:!p-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-rose-400" />
                </div>
                <span className="text-dark-400 text-xs lg:text-base hidden sm:inline">연간 총 지출</span>
                <span className="text-dark-400 text-xs sm:hidden">지출</span>
              </div>
              <p className="text-sm lg:text-2xl font-bold text-rose-400 truncate">
                -{formatAmount(yearTotal.expense)}
              </p>
            </div>

            <div className="card !p-3 lg:!p-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                </div>
                <span className="text-dark-400 text-xs lg:text-base hidden sm:inline">연간 순수익</span>
                <span className="text-dark-400 text-xs sm:hidden">순수익</span>
              </div>
              <p className={`text-sm lg:text-2xl font-bold truncate ${yearTotal.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {yearTotal.balance >= 0 ? '+' : ''}{formatAmount(yearTotal.balance)}
              </p>
            </div>
          </div>

          {/* 월별 현황 */}
          <div className="card !p-3 lg:!p-6">
            <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">
              월별 현황
            </h3>
            <div className="space-y-2 lg:space-y-3">
              {yearSummaries.map((summary) => {
                const maxAmount = Math.max(
                  ...yearSummaries.map((s) => Math.max(s.totalIncome, s.totalExpense))
                );
                const incomeWidth = maxAmount > 0 ? (summary.totalIncome / maxAmount) * 100 : 0;
                const expenseWidth = maxAmount > 0 ? (summary.totalExpense / maxAmount) * 100 : 0;

                return (
                  <div key={summary.month} className="flex items-center gap-2 lg:gap-4">
                    <div className="w-8 lg:w-12 text-xs lg:text-sm font-medium text-dark-300">
                      {summary.month}월
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <div
                          className="h-3 lg:h-4 bg-emerald-500/60 rounded"
                          style={{ width: `${incomeWidth}%`, minWidth: summary.totalIncome > 0 ? '4px' : '0' }}
                        />
                        <span className="text-[10px] lg:text-xs text-emerald-400 min-w-[50px] lg:min-w-[80px]">
                          +{formatAmount(summary.totalIncome)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2">
                        <div
                          className="h-3 lg:h-4 bg-rose-500/60 rounded"
                          style={{ width: `${expenseWidth}%`, minWidth: summary.totalExpense > 0 ? '4px' : '0' }}
                        />
                        <span className="text-[10px] lg:text-xs text-rose-400 min-w-[50px] lg:min-w-[80px]">
                          -{formatAmount(summary.totalExpense)}
                        </span>
                      </div>
                    </div>
                    <div className={`w-16 lg:w-24 text-right text-[10px] lg:text-sm font-medium ${
                      summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {summary.balance >= 0 ? '+' : ''}{formatAmount(summary.balance)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 지출 카테고리 TOP 5 */}
          {expenseByCategory.length > 0 && (
            <div className="card !p-3 lg:!p-6">
              <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">
                주요 지출 카테고리
              </h3>
              <div className="space-y-2 lg:space-y-3">
                {expenseByCategory.map(([category, amount], index) => {
                  const maxAmount = expenseByCategory[0][1];
                  const width = (amount / maxAmount) * 100;

                  return (
                    <div key={category} className="flex items-center gap-2 lg:gap-4">
                      <div className="w-5 lg:w-6 text-xs lg:text-sm font-medium text-dark-500">
                        {index + 1}
                      </div>
                      <div className="w-16 lg:w-24 text-xs lg:text-sm text-dark-200 truncate">
                        {categoryLabels[category] || category}
                      </div>
                      <div className="flex-1">
                        <div
                          className="h-5 lg:h-6 bg-rose-500/40 rounded flex items-center px-2"
                          style={{ width: `${width}%`, minWidth: '50px' }}
                        >
                          <span className="text-[10px] lg:text-xs text-rose-200 whitespace-nowrap">
                            {formatAmount(amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-8 lg:py-12">
          <p className="text-dark-500 text-sm lg:text-base">이 연도에 등록된 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}
