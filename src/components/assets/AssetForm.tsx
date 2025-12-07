import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../store/AppContext';
import {
  ASSET_CATEGORY_LABELS,
  type Asset,
  type AssetCategory,
} from '../../types';

interface AssetFormProps {
  asset?: Asset | null;
  onClose: () => void;
}

const assetCategories: AssetCategory[] = ['real_estate', 'vehicle', 'savings', 'investment', 'other_asset'];

export function AssetForm({ asset, onClose }: AssetFormProps) {
  const { addAsset, updateAsset } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('real_estate');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setCategory(asset.category);
      setPurchaseValue(asset.purchaseValue ? String(asset.purchaseValue) : '');
      setCurrentValue(String(asset.currentValue));
      setPurchaseDate(asset.purchaseDate || '');
      setDescription(asset.description || '');
      setMemo(asset.memo || '');
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentValue) return;

    const data: Asset = {
      id: asset?.id || uuidv4(),
      name: name.trim(),
      category,
      purchaseValue: purchaseValue ? Number(purchaseValue) : undefined,
      currentValue: Number(currentValue),
      purchaseDate: purchaseDate || undefined,
      description: description.trim() || undefined,
      memo: memo.trim() || undefined,
      createdAt: asset?.createdAt || new Date().toISOString(),
    };

    if (asset) {
      updateAsset(asset.id, data);
    } else {
      addAsset(data);
    }

    onClose();
  };

  // 변동 계산
  const valueDiff = Number(currentValue || 0) - Number(purchaseValue || 0);
  const valueChangePercent = Number(purchaseValue) > 0
    ? ((valueDiff / Number(purchaseValue)) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="card w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-b-2xl">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-dark-100">
            {asset ? '자산 수정' : '새 자산 추가'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
          {/* 자산명 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              자산명 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 강남 아파트, 테슬라 모델3"
              className="input text-sm lg:text-base"
              autoFocus
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="input text-sm lg:text-base"
            >
              {assetCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {ASSET_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* 현재 가치 (필수) */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              현재 가치 *
            </label>
            <div className="relative">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0"
                className="input pr-10 text-sm lg:text-base"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs lg:text-sm">원</span>
            </div>
          </div>

          {/* 취득가 (선택) */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              취득가
            </label>
            <div className="relative">
              <input
                type="number"
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(e.target.value)}
                placeholder="선택사항"
                className="input pr-10 text-sm lg:text-base"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs lg:text-sm">원</span>
            </div>
          </div>

          {/* 취득일 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              취득일
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="input text-sm lg:text-base"
              placeholder="선택사항"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              설명
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 서울시 강남구 역삼동, 2023년식"
              className="input text-sm lg:text-base"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 (선택)"
              className="input min-h-[50px] lg:min-h-[60px] resize-none text-sm lg:text-base"
            />
          </div>

          {/* 변동 미리보기 (취득가가 있을 때만) */}
          {purchaseValue && currentValue && Number(purchaseValue) > 0 && (
            <div className={`p-3 lg:p-4 rounded-xl ${valueDiff >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
              <p className="text-xs lg:text-sm text-dark-400 mb-1">가치 변동</p>
              <p className={`text-lg lg:text-xl font-bold ${valueDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {valueDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('ko-KR').format(valueDiff)}원
                <span className="text-sm lg:text-base ml-2">
                  ({valueDiff >= 0 ? '+' : ''}{valueChangePercent}%)
                </span>
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 lg:gap-3 pt-3 lg:pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 text-sm lg:text-base">
              취소
            </button>
            <button type="submit" className="btn bg-emerald-500 hover:bg-emerald-600 text-white flex-1 text-sm lg:text-base">
              {asset ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
