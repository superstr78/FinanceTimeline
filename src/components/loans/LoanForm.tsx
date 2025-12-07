import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../store/AppContext';
import {
  REPAYMENT_TYPE_LABELS,
  REPAYMENT_TYPE_DESC,
  type Loan,
  type RepaymentType,
} from '../../types';

interface LoanFormProps {
  loan?: Loan | null;
  onClose: () => void;
}

const repaymentTypes: RepaymentType[] = ['equal_principal_interest', 'equal_principal', 'bullet'];

export function LoanForm({ loan, onClose }: LoanFormProps) {
  const { addLoan, updateLoan } = useApp();

  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('equal_principal_interest');
  const [termMonths, setTermMonths] = useState('');
  const [termYears, setTermYears] = useState('');
  const [startDate, setStartDate] = useState('');
  const [paymentDay, setPaymentDay] = useState('25');
  const [memo, setMemo] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (loan) {
      setName(loan.name);
      setPrincipal(String(loan.principal));
      setInterestRate(String(loan.interestRate));
      setRepaymentType(loan.repaymentType);
      setTermYears(String(Math.floor(loan.termMonths / 12)));
      setTermMonths(String(loan.termMonths % 12));
      setStartDate(loan.startDate);
      setPaymentDay(String(loan.paymentDay));
      setMemo(loan.memo || '');
    } else {
      const now = new Date();
      setStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
    }
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !principal || !interestRate || !startDate) return;

    const totalMonths = (parseInt(termYears) || 0) * 12 + (parseInt(termMonths) || 0);
    if (totalMonths <= 0) return;

    const data: Loan = {
      id: loan?.id || uuidv4(),
      name: name.trim(),
      principal: Number(principal),
      interestRate: Number(interestRate),
      repaymentType,
      termMonths: totalMonths,
      startDate,
      paymentDay: parseInt(paymentDay) || 25,
      memo: memo.trim() || undefined,
      createdAt: loan?.createdAt || new Date().toISOString(),
    };

    if (loan) {
      updateLoan(loan.id, data);
    } else {
      addLoan(data);
    }

    onClose();
  };

  // 예상 월 상환액 계산
  const calculateMonthlyPayment = () => {
    const p = Number(principal);
    const r = Number(interestRate) / 100 / 12;
    const n = (parseInt(termYears) || 0) * 12 + (parseInt(termMonths) || 0);

    if (!p || !n) return null;

    if (repaymentType === 'equal_principal_interest') {
      if (r === 0) return Math.round(p / n);
      return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    } else if (repaymentType === 'equal_principal') {
      const principalPayment = p / n;
      const firstInterest = p * r;
      return Math.round(principalPayment + firstInterest);
    } else {
      return Math.round(p * r);
    }
  };

  const monthlyPayment = calculateMonthlyPayment();

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-dark-100">
            {loan ? '대출 수정' : '새 대출 추가'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 대출명 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              대출명 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 주택담보대출, 신용대출"
              className="input"
              autoFocus
            />
          </div>

          {/* 대출 원금 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              대출 원금 *
            </label>
            <div className="relative">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="0"
                className="input pr-12"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">원</span>
            </div>
          </div>

          {/* 연이율 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              연이율 *
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.0"
                className="input pr-12"
                min="0"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">%</span>
            </div>
          </div>

          {/* 상환 방식 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-dark-300">상환 방식</label>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-dark-500 hover:text-dark-300"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {showHelp && (
              <div className="mb-3 p-3 bg-dark-800/50 rounded-lg text-sm space-y-2">
                {repaymentTypes.map((type) => (
                  <div key={type}>
                    <span className="text-dark-200 font-medium">{REPAYMENT_TYPE_LABELS[type]}</span>
                    <p className="text-dark-400 text-xs">{REPAYMENT_TYPE_DESC[type]}</p>
                  </div>
                ))}
              </div>
            )}
            <select
              value={repaymentType}
              onChange={(e) => setRepaymentType(e.target.value as RepaymentType)}
              className="input"
            >
              {repaymentTypes.map((type) => (
                <option key={type} value={type}>
                  {REPAYMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* 상환 기간 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              상환 기간 *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                  placeholder="0"
                  className="input pr-12"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">년</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder="0"
                  className="input pr-12"
                  min="0"
                  max="11"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">개월</span>
              </div>
            </div>
          </div>

          {/* 대출 시작일 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              대출 시작일 *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>

          {/* 상환일 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              매월 상환일
            </label>
            <select
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              className="input"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}일
                </option>
              ))}
            </select>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 (선택)"
              className="input min-h-[60px] resize-none"
            />
          </div>

          {/* 예상 월 상환액 */}
          {monthlyPayment && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-dark-400 mb-1">예상 월 상환액</p>
              <p className="text-xl font-bold text-blue-400">
                {new Intl.NumberFormat('ko-KR').format(monthlyPayment)}원
              </p>
              {repaymentType === 'equal_principal' && (
                <p className="text-xs text-dark-500 mt-1">* 첫 달 기준 (이후 점점 감소)</p>
              )}
              {repaymentType === 'bullet' && (
                <p className="text-xs text-dark-500 mt-1">* 이자만 (만기에 원금 일시 상환)</p>
              )}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              취소
            </button>
            <button type="submit" className="btn bg-blue-500 hover:bg-blue-600 text-white flex-1">
              {loan ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
