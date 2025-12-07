import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function SummaryPage() {
  const { currentYear, getMultiMonthSummaries, transactions } = useApp();

  // 현재 연도의 12개월 요약
  const yearSummaries = useMemo(
    () => getMultiMonthSummaries(currentYear, 1, 12),
    [getMultiMonthSummaries, currentYear]
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

  // 카테고리별 지출 집계
  const expenseByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        // 연간 반복 거래 처리
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

  return (
    <div className="space-y-6">
      {/* 연간 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-dark-400">연간 총 수입</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            +{formatAmount(yearTotal.income)}원
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-dark-400">연간 총 지출</span>
          </div>
          <p className="text-2xl font-bold text-rose-400">
            -{formatAmount(yearTotal.expense)}원
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-dark-400">연간 순수익</span>
          </div>
          <p className={`text-2xl font-bold ${yearTotal.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {yearTotal.balance >= 0 ? '+' : ''}{formatAmount(yearTotal.balance)}원
          </p>
        </div>
      </div>

      {/* 월별 현황 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">
          {currentYear}년 월별 현황
        </h3>
        <div className="space-y-3">
          {yearSummaries.map((summary) => {
            const maxAmount = Math.max(
              ...yearSummaries.map((s) => Math.max(s.totalIncome, s.totalExpense))
            );
            const incomeWidth = maxAmount > 0 ? (summary.totalIncome / maxAmount) * 100 : 0;
            const expenseWidth = maxAmount > 0 ? (summary.totalExpense / maxAmount) * 100 : 0;

            return (
              <div key={summary.month} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-dark-300">
                  {summary.month}월
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 bg-emerald-500/60 rounded"
                      style={{ width: `${incomeWidth}%`, minWidth: summary.totalIncome > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-emerald-400 min-w-[80px]">
                      +{formatAmount(summary.totalIncome)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 bg-rose-500/60 rounded"
                      style={{ width: `${expenseWidth}%`, minWidth: summary.totalExpense > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-rose-400 min-w-[80px]">
                      -{formatAmount(summary.totalExpense)}
                    </span>
                  </div>
                </div>
                <div className={`w-24 text-right text-sm font-medium ${
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
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">
            주요 지출 카테고리
          </h3>
          <div className="space-y-3">
            {expenseByCategory.map(([category, amount], index) => {
              const maxAmount = expenseByCategory[0][1];
              const width = (amount / maxAmount) * 100;

              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-6 text-sm font-medium text-dark-500">
                    {index + 1}
                  </div>
                  <div className="w-24 text-sm text-dark-200">
                    {categoryLabels[category] || category}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-rose-500/40 rounded flex items-center px-2"
                      style={{ width: `${width}%`, minWidth: '60px' }}
                    >
                      <span className="text-xs text-rose-200 whitespace-nowrap">
                        {formatAmount(amount)}원
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
