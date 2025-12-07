import { useState, useMemo } from 'react';
import { Plus, Landmark, Edit2, Trash2, Calendar, Percent, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { LoanForm } from '../components/loans/LoanForm';
import { REPAYMENT_TYPE_LABELS, type Loan } from '../types';

export function LoansPage() {
  const { loans, deleteLoan, getLoanPaymentsForMonth, currentYear, currentMonth } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLoan(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 대출을 삭제하시겠습니까?`)) {
      deleteLoan(id);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 현재 월 대출 상환 정보
  const currentMonthPayments = useMemo(
    () => getLoanPaymentsForMonth(currentYear, currentMonth),
    [getLoanPaymentsForMonth, currentYear, currentMonth]
  );

  // 총 대출 요약
  const totalSummary = useMemo(() => {
    const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0);
    const currentPayments = currentMonthPayments;
    const totalMonthlyPayment = currentPayments.reduce((sum, p) => sum + p.totalPayment, 0);
    const totalInterest = currentPayments.reduce((sum, p) => sum + p.interest, 0);
    const totalRemainingPrincipal = currentPayments.reduce((sum, p) => sum + p.remainingPrincipal, 0);

    return {
      totalPrincipal,
      totalMonthlyPayment,
      totalInterest,
      totalRemainingPrincipal,
    };
  }, [loans, currentMonthPayments]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="card !p-3 lg:!p-6">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">총 대출 원금</p>
          <p className="text-sm lg:text-2xl font-bold text-dark-100 truncate">
            {formatAmount(totalSummary.totalPrincipal)}
          </p>
        </div>
        <div className="card !p-3 lg:!p-6">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">이번 달 상환액</p>
          <p className="text-sm lg:text-2xl font-bold text-blue-400 truncate">
            {formatAmount(totalSummary.totalMonthlyPayment)}
          </p>
        </div>
        <div className="card !p-3 lg:!p-6">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">이번 달 이자</p>
          <p className="text-sm lg:text-2xl font-bold text-rose-400 truncate">
            {formatAmount(totalSummary.totalInterest)}
          </p>
        </div>
        <div className="card !p-3 lg:!p-6">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">남은 원금</p>
          <p className="text-sm lg:text-2xl font-bold text-amber-400 truncate">
            {formatAmount(totalSummary.totalRemainingPrincipal)}
          </p>
        </div>
      </div>

      {/* 대출 목록 */}
      <div className="card !p-3 lg:!p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-semibold text-dark-100">대출 목록</h3>
          <button
            onClick={() => setShowForm(true)}
            className="btn bg-blue-500 hover:bg-blue-600 text-white text-xs lg:text-sm py-1.5 px-2 lg:py-2 lg:px-3"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">대출 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 lg:py-12 text-dark-500">
            <Landmark className="w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 opacity-50" />
            <p className="text-sm lg:text-lg mb-2">등록된 대출이 없습니다</p>
            <p className="text-xs lg:text-sm mb-4 text-center px-4">대출을 추가하면 상환 계획이 자동으로 타임라인에 표시됩니다</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              첫 대출 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {loans.map((loan) => {
              const payment = currentMonthPayments.find((p) => p.loanId === loan.id);
              const startDate = new Date(loan.startDate);
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + loan.termMonths);

              return (
                <div
                  key={loan.id}
                  className="p-3 lg:p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-dark-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm lg:text-lg font-semibold text-dark-100 truncate">{loan.name}</h4>
                      <p className="text-xs lg:text-sm text-dark-400">
                        {REPAYMENT_TYPE_LABELS[loan.repaymentType]}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(loan)}
                        className="p-1.5 lg:p-2 text-dark-400 hover:text-dark-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id, loan.name)}
                        className="p-1.5 lg:p-2 text-dark-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-3 lg:mb-4">
                    <div>
                      <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">대출 원금</p>
                      <p className="text-xs lg:text-base font-medium text-dark-200 truncate">{formatAmount(loan.principal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">연이율</p>
                      <p className="text-xs lg:text-base font-medium text-dark-200 flex items-center gap-1">
                        <Percent className="w-3 h-3 hidden lg:inline" />
                        {loan.interestRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">상환 기간</p>
                      <p className="text-xs lg:text-base font-medium text-dark-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 hidden lg:inline" />
                        {Math.floor(loan.termMonths / 12)}년 {loan.termMonths % 12}개월
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">시작~종료</p>
                      <p className="text-xs lg:text-base font-medium text-dark-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 hidden lg:inline" />
                        <span className="truncate">{startDate.getFullYear()}.{startDate.getMonth() + 1} ~ {endDate.getFullYear()}.{endDate.getMonth() + 1}</span>
                      </p>
                    </div>
                  </div>

                  {payment && (
                    <div className="p-2 lg:p-3 bg-dark-900/50 rounded-lg">
                      <p className="text-[10px] lg:text-xs text-dark-500 mb-1.5 lg:mb-2">
                        {currentYear}년 {currentMonth}월 상환 ({payment.monthNumber}회차)
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm">
                        <div>
                          <p className="text-dark-500 text-[10px] lg:text-xs">원금</p>
                          <p className="font-medium text-dark-300 truncate">{formatAmount(payment.principal)}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 text-[10px] lg:text-xs">이자</p>
                          <p className="font-medium text-rose-400 truncate">{formatAmount(payment.interest)}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 text-[10px] lg:text-xs">총 상환</p>
                          <p className="font-medium text-blue-400 truncate">{formatAmount(payment.totalPayment)}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 text-[10px] lg:text-xs">남은 원금</p>
                          <p className="font-medium text-amber-400 truncate">{formatAmount(payment.remainingPrincipal)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {loan.memo && (
                    <p className="mt-2 lg:mt-3 text-xs lg:text-sm text-dark-500">{loan.memo}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <LoanForm loan={editingLoan} onClose={handleCloseForm} />
      )}
    </div>
  );
}
