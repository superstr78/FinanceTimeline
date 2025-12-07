import { useState, useEffect, useCallback } from 'react';
import type { Transaction, AppState, MonthSummary, Loan, LoanPayment } from '../types';

const STORAGE_KEY = 'finance-timeline-data';

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const now = new Date();
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        transactions: parsed.transactions || [],
        loans: parsed.loans || [],
        currentYear: parsed.currentYear || now.getFullYear(),
        currentMonth: parsed.currentMonth || now.getMonth() + 1,
      };
    } catch {
      return {
        transactions: [],
        loans: [],
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
      };
    }
  }
  return {
    transactions: [],
    loans: [],
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
};

// 대출 상환 계산 함수들
function calculateEqualPrincipalInterestPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  // 원리금균등상환: 매월 동일한 금액
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

function getLoanPaymentForMonth(loan: Loan, targetYear: number, targetMonth: number): LoanPayment | null {
  const startDate = new Date(loan.startDate);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;

  // 대출 시작 이전이면 null
  if (targetYear < startYear || (targetYear === startYear && targetMonth < startMonth)) {
    return null;
  }

  // 몇 회차인지 계산
  const monthsDiff = (targetYear - startYear) * 12 + (targetMonth - startMonth) + 1;

  // 상환 기간 초과하면 null (만기일시상환의 마지막 달 제외)
  if (monthsDiff > loan.termMonths) {
    return null;
  }

  const monthlyRate = loan.interestRate / 100 / 12;
  let principal = 0;
  let interest = 0;
  let remainingPrincipal = loan.principal;

  if (loan.repaymentType === 'equal_principal_interest') {
    // 원리금균등상환
    const monthlyPayment = calculateEqualPrincipalInterestPayment(
      loan.principal,
      loan.interestRate,
      loan.termMonths
    );

    // 이전 회차까지의 남은 원금 계산
    for (let i = 1; i < monthsDiff; i++) {
      const interestForMonth = remainingPrincipal * monthlyRate;
      const principalForMonth = monthlyPayment - interestForMonth;
      remainingPrincipal -= principalForMonth;
    }

    interest = remainingPrincipal * monthlyRate;
    principal = monthlyPayment - interest;
    remainingPrincipal -= principal;

  } else if (loan.repaymentType === 'equal_principal') {
    // 원금균등상환
    const monthlyPrincipal = loan.principal / loan.termMonths;

    // 이전 회차까지의 남은 원금 계산
    remainingPrincipal = loan.principal - (monthlyPrincipal * (monthsDiff - 1));

    interest = remainingPrincipal * monthlyRate;
    principal = monthlyPrincipal;
    remainingPrincipal -= principal;

  } else if (loan.repaymentType === 'bullet') {
    // 만기일시상환
    interest = loan.principal * monthlyRate;
    principal = monthsDiff === loan.termMonths ? loan.principal : 0;
    remainingPrincipal = monthsDiff === loan.termMonths ? 0 : loan.principal;
  }

  const paymentDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(loan.paymentDay).padStart(2, '0')}`;

  return {
    loanId: loan.id,
    loanName: loan.name,
    date: paymentDate,
    monthNumber: monthsDiff,
    principal: Math.round(principal),
    interest: Math.round(interest),
    totalPayment: Math.round(principal + interest),
    remainingPrincipal: Math.max(0, Math.round(remainingPrincipal)),
  };
}

export function useStore() {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ==================== 거래 관련 ====================

  const addTransaction = useCallback((transaction: Transaction) => {
    setState((prev) => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
    }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  // ==================== 대출 관련 ====================

  const addLoan = useCallback((loan: Loan) => {
    setState((prev) => ({
      ...prev,
      loans: [...prev.loans, loan],
    }));
  }, []);

  const updateLoan = useCallback((id: string, updates: Partial<Loan>) => {
    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    }));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      loans: prev.loans.filter((l) => l.id !== id),
    }));
  }, []);

  // 특정 월의 대출 상환 내역 가져오기
  const getLoanPaymentsForMonth = useCallback(
    (year: number, month: number): LoanPayment[] => {
      return state.loans
        .map((loan) => getLoanPaymentForMonth(loan, year, month))
        .filter((payment): payment is LoanPayment => payment !== null);
    },
    [state.loans]
  );

  // ==================== 날짜/뷰 관련 ====================

  const setCurrentDate = useCallback((year: number, month: number) => {
    setState((prev) => ({
      ...prev,
      currentYear: year,
      currentMonth: month,
    }));
  }, []);

  // 특정 월의 거래 목록 가져오기 (반복 거래 포함)
  const getTransactionsForMonth = useCallback(
    (year: number, month: number): Transaction[] => {
      const result: Transaction[] = [];
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;

      state.transactions.forEach((t) => {
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear();
        const tMonth = tDate.getMonth() + 1;
        const tDay = tDate.getDate();

        if (t.recurrence === 'once') {
          if (tYear === year && tMonth === month) {
            result.push(t);
          }
        } else if (t.recurrence === 'monthly') {
          const startDate = new Date(t.date);
          const currentDate = new Date(year, month - 1, tDay);
          const endDate = t.recurrenceEndDate ? new Date(t.recurrenceEndDate) : null;

          if (currentDate >= startDate && (!endDate || currentDate <= endDate)) {
            const adjustedDate = `${monthStr}-${String(tDay).padStart(2, '0')}`;
            result.push({ ...t, date: adjustedDate });
          }
        } else if (t.recurrence === 'yearly') {
          if (tMonth === month) {
            const startDate = new Date(t.date);
            const currentDate = new Date(year, month - 1, tDay);
            const endDate = t.recurrenceEndDate ? new Date(t.recurrenceEndDate) : null;

            if (currentDate >= startDate && (!endDate || currentDate <= endDate)) {
              const adjustedDate = `${year}-${String(month).padStart(2, '0')}-${String(tDay).padStart(2, '0')}`;
              result.push({ ...t, date: adjustedDate });
            }
          }
        }
      });

      return result.sort((a, b) => a.date.localeCompare(b.date));
    },
    [state.transactions]
  );

  // 월별 요약 계산 (대출 이자 포함)
  const getMonthSummary = useCallback(
    (year: number, month: number): MonthSummary => {
      const transactions = getTransactionsForMonth(year, month);
      const loanPayments = getLoanPaymentsForMonth(year, month);

      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // 대출 이자만 지출로 계산 (원금은 제외)
      const totalLoanInterest = loanPayments.reduce((sum, p) => sum + p.interest, 0);

      return {
        year,
        month,
        totalIncome,
        totalExpense: totalExpense + totalLoanInterest,
        balance: totalIncome - totalExpense - totalLoanInterest,
      };
    },
    [getTransactionsForMonth, getLoanPaymentsForMonth]
  );

  // 여러 달의 요약 가져오기
  const getMultiMonthSummaries = useCallback(
    (startYear: number, startMonth: number, count: number): MonthSummary[] => {
      const summaries: MonthSummary[] = [];
      let year = startYear;
      let month = startMonth;

      for (let i = 0; i < count; i++) {
        summaries.push(getMonthSummary(year, month));
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }

      return summaries;
    },
    [getMonthSummary]
  );

  // 누적 잔액 계산
  const getCumulativeBalance = useCallback(
    (upToYear: number, upToMonth: number): number => {
      let balance = 0;
      for (let year = 2020; year <= upToYear; year++) {
        const endMonth = year === upToYear ? upToMonth : 12;
        for (let month = 1; month <= endMonth; month++) {
          const summary = getMonthSummary(year, month);
          balance += summary.balance;
        }
      }
      return balance;
    },
    [getMonthSummary]
  );

  return {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addLoan,
    updateLoan,
    deleteLoan,
    getLoanPaymentsForMonth,
    setCurrentDate,
    getTransactionsForMonth,
    getMonthSummary,
    getMultiMonthSummaries,
    getCumulativeBalance,
  };
}
