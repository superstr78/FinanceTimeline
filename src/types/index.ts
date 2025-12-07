// 거래 유형
export type TransactionType = 'income' | 'expense';

// 반복 유형
export type RecurrenceType = 'once' | 'monthly' | 'yearly';

// 카테고리
export type Category =
  | 'salary'      // 월급
  | 'bonus'       // 보너스
  | 'other_income' // 기타 수입
  | 'rent'        // 월세/주거비
  | 'insurance'   // 보험
  | 'subscription' // 구독료
  | 'utilities'   // 공과금
  | 'transport'   // 교통비
  | 'food'        // 식비
  | 'shopping'    // 쇼핑
  | 'travel'      // 여행
  | 'education'   // 교육
  | 'medical'     // 의료
  | 'other_expense'; // 기타 지출

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // YYYY-MM-DD
  recurrence: RecurrenceType;
  recurrenceEndDate?: string; // 반복 종료일 (없으면 무기한)
  memo?: string;
  createdAt: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface AppState {
  transactions: Transaction[];
  loans: Loan[];
  currentYear: number;
  currentMonth: number;
}

// 카테고리 라벨
export const CATEGORY_LABELS: Record<Category, string> = {
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

// 카테고리 아이콘 (lucide-react 아이콘 이름)
export const CATEGORY_ICONS: Record<Category, string> = {
  salary: 'Wallet',
  bonus: 'Gift',
  other_income: 'PiggyBank',
  rent: 'Home',
  insurance: 'Shield',
  subscription: 'RefreshCw',
  utilities: 'Zap',
  transport: 'Car',
  food: 'Utensils',
  shopping: 'ShoppingBag',
  travel: 'Plane',
  education: 'GraduationCap',
  medical: 'Heart',
  other_expense: 'MoreHorizontal',
};

// 수입 카테고리
export const INCOME_CATEGORIES: Category[] = ['salary', 'bonus', 'other_income'];

// 지출 카테고리
export const EXPENSE_CATEGORIES: Category[] = [
  'rent', 'insurance', 'subscription', 'utilities',
  'transport', 'food', 'shopping', 'travel', 'education', 'medical', 'other_expense'
];

// 반복 라벨
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  once: '일회성',
  monthly: '매월',
  yearly: '매년',
};

// ==================== 대출 관련 타입 ====================

// 상환 방식
export type RepaymentType =
  | 'equal_principal_interest'  // 원리금균등상환
  | 'equal_principal'           // 원금균등상환
  | 'bullet';                   // 만기일시상환

// 대출 인터페이스
export interface Loan {
  id: string;
  name: string;                 // 대출명 (예: 주택담보대출)
  principal: number;            // 대출 원금
  interestRate: number;         // 연이율 (%)
  repaymentType: RepaymentType; // 상환 방식
  termMonths: number;           // 상환 기간 (개월)
  startDate: string;            // 대출 시작일 (YYYY-MM-DD)
  paymentDay: number;           // 매월 상환일 (1-28)
  memo?: string;
  createdAt: string;
}

// 월별 대출 상환 내역
export interface LoanPayment {
  loanId: string;
  loanName: string;
  date: string;                 // 상환일
  monthNumber: number;          // 회차
  principal: number;            // 원금 상환액
  interest: number;             // 이자
  totalPayment: number;         // 총 상환액
  remainingPrincipal: number;   // 남은 원금
}

// 상환 방식 라벨
export const REPAYMENT_TYPE_LABELS: Record<RepaymentType, string> = {
  equal_principal_interest: '원리금균등상환',
  equal_principal: '원금균등상환',
  bullet: '만기일시상환',
};

// 상환 방식 설명
export const REPAYMENT_TYPE_DESC: Record<RepaymentType, string> = {
  equal_principal_interest: '매월 동일한 금액(원금+이자)을 상환',
  equal_principal: '매월 동일한 원금 + 점점 줄어드는 이자 상환',
  bullet: '매월 이자만 납부, 만기에 원금 일시 상환',
};
