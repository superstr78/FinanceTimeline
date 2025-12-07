import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { TransactionForm } from '../components/timeline/TransactionForm';
import {
  CATEGORY_LABELS,
  RECURRENCE_LABELS,
  type Transaction,
} from '../types';

type FilterType = 'all' | 'income' | 'expense';

export function TransactionsPage() {
  const { transactions, deleteTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 거래 목록
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // 타입 필터
        if (filterType !== 'all' && t.type !== filterType) return false;
        // 검색 필터
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            t.title.toLowerCase().includes(query) ||
            CATEGORY_LABELS[t.category].toLowerCase().includes(query) ||
            (t.memo && t.memo.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [transactions, filterType, searchQuery]);

  // 수입/지출 합계
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => {
        if (t.recurrence === 'monthly') return sum + t.amount * 12;
        return sum + t.amount;
      }, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => {
        if (t.recurrence === 'monthly') return sum + t.amount * 12;
        return sum + t.amount;
      }, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`"${title}" 거래를 삭제하시겠습니까?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-dark-400 text-sm mb-1">총 수입 (연간)</p>
          <p className="text-2xl font-bold text-emerald-400">+{formatAmount(totals.income)}원</p>
        </div>
        <div className="card">
          <p className="text-dark-400 text-sm mb-1">총 지출 (연간)</p>
          <p className="text-2xl font-bold text-rose-400">-{formatAmount(totals.expense)}원</p>
        </div>
        <div className="card">
          <p className="text-dark-400 text-sm mb-1">순수익 (연간)</p>
          <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totals.balance >= 0 ? '+' : ''}{formatAmount(totals.balance)}원
          </p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* 검색 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="거래 검색..."
            className="input pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* 필터 */}
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filterType === 'all'
                  ? 'bg-dark-700 text-dark-100'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filterType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              수입
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filterType === 'expense'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              지출
            </button>
          </div>

          {/* 추가 버튼 */}
          <button
            onClick={handleAdd}
            className="btn bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4" />
            거래 추가
          </button>
        </div>
      </div>

      {/* 거래 목록 */}
      <div className="card !p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-dark-500">
            {searchQuery || filterType !== 'all'
              ? '검색 결과가 없습니다'
              : '등록된 거래가 없습니다. 거래를 추가해보세요!'}
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 p-4 hover:bg-dark-800/50 transition-colors"
              >
                {/* 타입 인디케이터 */}
                <div
                  className={`w-1 h-12 rounded-full ${
                    t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-dark-100 truncate">{t.title}</h3>
                    {t.recurrence !== 'once' && (
                      <span className="px-2 py-0.5 bg-dark-700 rounded-full text-xs text-dark-300">
                        {RECURRENCE_LABELS[t.recurrence]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-500">
                    <span>{CATEGORY_LABELS[t.category]}</span>
                    <span>·</span>
                    <span>{formatDate(t.date)}</span>
                    {t.recurrenceEndDate && (
                      <>
                        <span>~</span>
                        <span>{formatDate(t.recurrenceEndDate)}</span>
                      </>
                    )}
                    {t.memo && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[200px]">{t.memo}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 금액 */}
                <div
                  className={`text-right font-semibold ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}원
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-2 text-dark-500 hover:text-dark-200 transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.title)}
                    className="p-2 text-dark-500 hover:text-rose-400 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 거래 수 표시 */}
      <div className="text-center text-sm text-dark-500">
        총 {filteredTransactions.length}개의 거래
        {filterType !== 'all' && ` (${filterType === 'income' ? '수입' : '지출'})`}
      </div>

      {/* 거래 추가/수정 폼 */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
