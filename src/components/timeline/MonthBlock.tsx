import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  Wallet,
  Gift,
  PiggyBank,
  Home,
  Shield,
  RefreshCw,
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Plane,
  GraduationCap,
  Heart,
  MoreHorizontal,
  Trash2,
  Landmark,
  Star,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  CATEGORY_LABELS,
  RECURRENCE_LABELS,
  EVENT_CATEGORY_LABELS,
  EVENT_COLOR_CLASSES,
  EVENT_TEXT_CLASSES,
  EVENT_BG_CLASSES,
  EVENT_ICON_BG_CLASSES,
  EVENT_BADGE_CLASSES,
  type Transaction,
  type Category,
  type LoanPayment,
  type LifeEvent,
} from '../../types';

interface MonthBlockProps {
  year: number;
  month: number;
  onEdit: (transaction: Transaction) => void;
  onEditEvent?: (event: LifeEvent) => void;
}

const iconMap: Record<Category, React.ReactNode> = {
  salary: <Wallet className="w-4 h-4" />,
  bonus: <Gift className="w-4 h-4" />,
  other_income: <PiggyBank className="w-4 h-4" />,
  rent: <Home className="w-4 h-4" />,
  insurance: <Shield className="w-4 h-4" />,
  subscription: <RefreshCw className="w-4 h-4" />,
  utilities: <Zap className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  travel: <Plane className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  medical: <Heart className="w-4 h-4" />,
  other_expense: <MoreHorizontal className="w-4 h-4" />,
};

export function MonthBlock({ year, month, onEdit, onEditEvent }: MonthBlockProps) {
  const { getTransactionsForMonth, getMonthSummary, deleteTransaction, getLoanPaymentsForMonth, getEventsForMonth, deleteEvent } = useApp();

  const transactions = useMemo(
    () => getTransactionsForMonth(year, month),
    [getTransactionsForMonth, year, month]
  );

  const loanPayments = useMemo(
    () => getLoanPaymentsForMonth(year, month),
    [getLoanPaymentsForMonth, year, month]
  );

  const events = useMemo(
    () => getEventsForMonth(year, month),
    [getEventsForMonth, year, month]
  );

  const summary = useMemo(
    () => getMonthSummary(year, month),
    [getMonthSummary, year, month]
  );

  // 대출 상환 총액
  const totalLoanPayment = useMemo(
    () => loanPayments.reduce((sum, p) => sum + p.totalPayment, 0),
    [loanPayments]
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getDay = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  // 거래, 대출 상환, 이벤트를 날짜순으로 정렬
  type TimelineItem =
    | { type: 'transaction'; data: Transaction }
    | { type: 'loan'; data: LoanPayment }
    | { type: 'event'; data: LifeEvent };

  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [
      ...transactions.map((t) => ({ type: 'transaction' as const, data: t })),
      ...loanPayments.map((l) => ({ type: 'loan' as const, data: l })),
      ...events.map((e) => ({ type: 'event' as const, data: e })),
    ];
    return items.sort((a, b) => {
      const dateA = a.data.date;
      const dateB = b.data.date;
      return dateA.localeCompare(dateB);
    });
  }, [transactions, loanPayments, events]);

  return (
    <div className="relative">
      {/* 월 헤더 */}
      <div className="sticky top-14 lg:top-16 z-10 bg-dark-950/95 backdrop-blur-sm py-3 lg:py-4 border-b border-dark-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg lg:text-xl font-bold text-dark-100">
            {year}년 {month}월
          </h2>
          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm flex-wrap">
            <div className="flex items-center gap-1 lg:gap-2">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">
                +{formatAmount(summary.totalIncome)}
              </span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-rose-400" />
              <span className="font-semibold text-rose-400">
                -{formatAmount(summary.totalExpense)}
              </span>
            </div>
            {totalLoanPayment > 0 && (
              <div className="flex items-center gap-1 lg:gap-2">
                <Landmark className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                <span className="font-semibold text-blue-400">
                  {formatAmount(totalLoanPayment)}
                </span>
              </div>
            )}
            <div className={`font-bold ${summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              = {summary.balance >= 0 ? '+' : ''}{formatAmount(summary.balance)}
            </div>
          </div>
        </div>
      </div>

      {/* 거래 목록 */}
      <div className="py-3 lg:py-4 space-y-2">
        {timelineItems.length === 0 ? (
          <div className="text-center py-6 lg:py-8 text-dark-500 text-sm">
            이 달에 등록된 거래가 없습니다
          </div>
        ) : (
          timelineItems.map((item) => {
            if (item.type === 'transaction') {
              const t = item.data;
              return (
                <div
                  key={`t-${t.id}-${t.date}`}
                  className="group flex items-center gap-2 lg:gap-4 p-3 lg:p-4 bg-dark-900/50 hover:bg-dark-800/50 rounded-xl border border-dark-800/50 hover:border-dark-700 transition-all cursor-pointer"
                  onClick={() => onEdit(t)}
                >
                  {/* 날짜 */}
                  <div className="w-10 lg:w-12 text-center flex-shrink-0">
                    <span className="text-xl lg:text-2xl font-bold text-dark-300">{getDay(t.date)}</span>
                    <span className="text-[10px] lg:text-xs text-dark-500 block">일</span>
                  </div>

                  {/* 구분선 */}
                  <div className={`w-1 h-10 lg:h-12 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                  {/* 카테고리 아이콘 - 모바일에서 숨김 */}
                  <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 ${
                    t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {iconMap[t.category]}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <h3 className="font-medium text-dark-100 truncate text-sm lg:text-base">{t.title}</h3>
                      {t.recurrence !== 'once' && (
                        <span className="hidden sm:flex items-center gap-1 px-1.5 lg:px-2 py-0.5 bg-dark-700 rounded-full text-[10px] lg:text-xs text-dark-300 flex-shrink-0">
                          <Repeat className="w-3 h-3" />
                          {RECURRENCE_LABELS[t.recurrence]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs lg:text-sm text-dark-500 truncate">
                      {CATEGORY_LABELS[t.category]}
                      {t.recurrence !== 'once' && <span className="sm:hidden"> · {RECURRENCE_LABELS[t.recurrence]}</span>}
                    </p>
                  </div>

                  {/* 금액 */}
                  <div className={`text-right font-semibold text-sm lg:text-base flex-shrink-0 ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('이 거래를 삭제하시겠습니까?')) {
                        deleteTransaction(t.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 lg:p-2 text-dark-500 hover:text-rose-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            } else if (item.type === 'loan') {
              // 대출 상환
              const l = item.data;
              return (
                <div
                  key={`l-${l.loanId}-${l.date}`}
                  className="flex items-center gap-2 lg:gap-4 p-3 lg:p-4 bg-blue-500/5 rounded-xl border border-blue-500/20"
                >
                  {/* 날짜 */}
                  <div className="w-10 lg:w-12 text-center flex-shrink-0">
                    <span className="text-xl lg:text-2xl font-bold text-dark-300">{getDay(l.date)}</span>
                    <span className="text-[10px] lg:text-xs text-dark-500 block">일</span>
                  </div>

                  {/* 구분선 */}
                  <div className="w-1 h-10 lg:h-12 rounded-full bg-blue-500 flex-shrink-0" />

                  {/* 아이콘 - 모바일에서 숨김 */}
                  <div className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center bg-blue-500/20 text-blue-400 flex-shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <h3 className="font-medium text-dark-100 truncate text-sm lg:text-base">{l.loanName}</h3>
                      <span className="px-1.5 lg:px-2 py-0.5 bg-blue-500/20 rounded-full text-[10px] lg:text-xs text-blue-400 flex-shrink-0">
                        {l.monthNumber}회차
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-dark-500 truncate">
                      <span className="hidden sm:inline">원금 {formatAmount(l.principal)} + 이자 {formatAmount(l.interest)}</span>
                      <span className="sm:hidden">이자 {formatAmount(l.interest)}</span>
                    </p>
                  </div>

                  {/* 금액 */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-blue-400 text-sm lg:text-base">{formatAmount(l.totalPayment)}</p>
                    <p className="text-[10px] lg:text-xs text-rose-400">-{formatAmount(l.interest)}</p>
                  </div>
                </div>
              );
            } else {
              // 이벤트
              const ev = item.data;
              return (
                <div
                  key={`e-${ev.id}`}
                  className={`group flex items-center gap-2 lg:gap-4 p-3 lg:p-4 rounded-xl border transition-all cursor-pointer ${EVENT_BG_CLASSES[ev.color]}`}
                  onClick={() => onEditEvent?.(ev)}
                >
                  {/* 날짜 */}
                  <div className="w-10 lg:w-12 text-center flex-shrink-0">
                    <span className="text-xl lg:text-2xl font-bold text-dark-300">{getDay(ev.date)}</span>
                    <span className="text-[10px] lg:text-xs text-dark-500 block">일</span>
                  </div>

                  {/* 구분선 */}
                  <div className={`w-1 h-10 lg:h-12 rounded-full flex-shrink-0 ${EVENT_COLOR_CLASSES[ev.color]}`} />

                  {/* 아이콘 - 모바일에서 숨김 */}
                  <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 ${EVENT_ICON_BG_CLASSES[ev.color]}`}>
                    {ev.isImportant ? (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Calendar className={`w-4 h-4 ${EVENT_TEXT_CLASSES[ev.color]}`} />
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <h3 className="font-medium text-dark-100 truncate text-sm lg:text-base">{ev.title}</h3>
                      {ev.isImportant && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 sm:hidden flex-shrink-0" />
                      )}
                      <span className={`hidden sm:inline px-2 py-0.5 rounded-full text-xs ${EVENT_BADGE_CLASSES[ev.color]}`}>
                        {EVENT_CATEGORY_LABELS[ev.category]}
                      </span>
                      {ev.isImportant && (
                        <span className="hidden sm:inline px-2 py-0.5 bg-amber-500/20 rounded-full text-xs text-amber-400">
                          중요
                        </span>
                      )}
                    </div>
                    <p className="text-xs lg:text-sm text-dark-500 truncate">
                      <span className="sm:hidden">{EVENT_CATEGORY_LABELS[ev.category]}</span>
                      {ev.description && <span className="hidden sm:inline">{ev.description}</span>}
                    </p>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('이 이벤트를 삭제하시겠습니까?')) {
                        deleteEvent(ev.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 lg:p-2 text-dark-500 hover:text-rose-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
}
