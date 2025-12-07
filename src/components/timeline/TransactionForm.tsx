import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../store/AppContext';
import {
  CATEGORY_LABELS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  RECURRENCE_LABELS,
  type Transaction,
  type TransactionType,
  type Category,
  type RecurrenceType,
} from '../../types';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const { addTransaction, updateTransaction, currentYear, currentMonth } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('other_expense');
  const [date, setDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('once');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setTitle(transaction.title);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDate(transaction.date);
      setRecurrence(transaction.recurrence);
      setRecurrenceEndDate(transaction.recurrenceEndDate || '');
      setMemo(transaction.memo || '');
    } else {
      // 기본값: 현재 보고 있는 월의 1일
      setDate(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    }
  }, [transaction, currentYear, currentMonth]);

  // 타입 변경 시 카테고리 초기화
  useEffect(() => {
    if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
      setCategory('salary');
    } else if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) {
      setCategory('other_expense');
    }
  }, [type, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !date) return;

    const data: Transaction = {
      id: transaction?.id || uuidv4(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      recurrence,
      recurrenceEndDate: recurrenceEndDate || undefined,
      memo: memo.trim() || undefined,
      createdAt: transaction?.createdAt || new Date().toISOString(),
    };

    if (transaction) {
      updateTransaction(transaction.id, data);
    } else {
      addTransaction(data);
    }

    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="card w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-b-2xl">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-dark-100">
            {transaction ? '거래 수정' : '새 거래 추가'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
          {/* 수입/지출 선택 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">유형</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 lg:py-3 rounded-xl font-medium text-sm lg:text-base transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                }`}
              >
                수입
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 lg:py-3 rounded-xl font-medium text-sm lg:text-base transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                }`}
              >
                지출
              </button>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 월급, 넷플릭스 구독료"
              className="input text-sm lg:text-base"
              autoFocus
            />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">금액 *</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="input pr-12 text-sm lg:text-base"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">원</span>
            </div>
          </div>

          {/* 카테고리 & 날짜 */}
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="input text-sm lg:text-base"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">날짜 *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input text-sm lg:text-base"
              />
            </div>
          </div>

          {/* 반복 설정 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">반복</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="input text-sm lg:text-base"
            >
              {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* 반복 종료일 (반복 선택시만) */}
          {recurrence !== 'once' && (
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
                반복 종료일 (선택)
              </label>
              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className="input text-sm lg:text-base"
              />
              <p className="text-[10px] lg:text-xs text-dark-500 mt-1">비워두면 무기한 반복</p>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 (선택)"
              className="input min-h-[60px] lg:min-h-[80px] resize-none text-sm lg:text-base"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 lg:gap-3 pt-3 lg:pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 text-sm lg:text-base">
              취소
            </button>
            <button
              type="submit"
              className={`btn flex-1 text-white text-sm lg:text-base ${
                type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              {transaction ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
