import { useState, useMemo } from 'react';
import { Plus, Building2, Car, PiggyBank, TrendingUp, Package, Edit2, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { AssetForm } from '../components/assets/AssetForm';
import { ASSET_CATEGORY_LABELS, type Asset, type AssetCategory } from '../types';

const CATEGORY_ICONS: Record<AssetCategory, React.FC<{ className?: string }>> = {
  real_estate: Building2,
  vehicle: Car,
  savings: PiggyBank,
  investment: TrendingUp,
  other_asset: Package,
};

export function AssetsPage() {
  const { assets, deleteAsset, getTotalAssetValue, getTotalLoanBalance, getNetWorth } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 자산을 삭제하시겠습니까?`)) {
      deleteAsset(id);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 카테고리별 자산 그룹화
  const assetsByCategory = useMemo(() => {
    const grouped: Record<AssetCategory, Asset[]> = {
      real_estate: [],
      vehicle: [],
      savings: [],
      investment: [],
      other_asset: [],
    };
    assets.forEach((asset) => {
      grouped[asset.category].push(asset);
    });
    return grouped;
  }, [assets]);

  // 카테고리별 합계
  const categoryTotals = useMemo(() => {
    const totals: Record<AssetCategory, number> = {
      real_estate: 0,
      vehicle: 0,
      savings: 0,
      investment: 0,
      other_asset: 0,
    };
    assets.forEach((asset) => {
      totals[asset.category] += asset.currentValue;
    });
    return totals;
  }, [assets]);

  const totalAssetValue = getTotalAssetValue();
  const totalLoanBalance = getTotalLoanBalance();
  const netWorth = getNetWorth();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 순자산 요약 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
        <div className="card !p-4 lg:!p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">총 자산</p>
          <p className="text-lg lg:text-3xl font-bold text-emerald-400 truncate">
            {formatAmount(totalAssetValue)}원
          </p>
        </div>
        <div className="card !p-4 lg:!p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
          <p className="text-xs lg:text-sm text-dark-400 mb-1">총 부채 (대출 잔액)</p>
          <p className="text-lg lg:text-3xl font-bold text-rose-400 truncate">
            {formatAmount(totalLoanBalance)}원
          </p>
        </div>
        <div className={`card !p-4 lg:!p-6 ${netWorth >= 0 ? 'bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'}`}>
          <p className="text-xs lg:text-sm text-dark-400 mb-1">순자산</p>
          <p className={`text-lg lg:text-3xl font-bold truncate ${netWorth >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
            {netWorth < 0 && '-'}{formatAmount(Math.abs(netWorth))}원
          </p>
        </div>
      </div>

      {/* 카테고리별 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        {(Object.keys(categoryTotals) as AssetCategory[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const total = categoryTotals[category];
          return (
            <div key={category} className="card !p-3 lg:!p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-dark-400" />
                <p className="text-xs text-dark-400">{ASSET_CATEGORY_LABELS[category]}</p>
              </div>
              <p className="text-sm lg:text-lg font-semibold text-dark-100 truncate">
                {formatAmount(total)}
              </p>
            </div>
          );
        })}
      </div>

      {/* 자산 목록 */}
      <div className="card !p-3 lg:!p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-semibold text-dark-100">자산 목록</h3>
          <button
            onClick={() => setShowForm(true)}
            className="btn bg-emerald-500 hover:bg-emerald-600 text-white text-xs lg:text-sm py-1.5 px-2 lg:py-2 lg:px-3"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">자산 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 lg:py-12 text-dark-500">
            <Building2 className="w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 opacity-50" />
            <p className="text-sm lg:text-lg mb-2">등록된 자산이 없습니다</p>
            <p className="text-xs lg:text-sm mb-4 text-center px-4">부동산, 자동차, 예금 등 보유 자산을 등록하세요</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
            >
              첫 자산 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {(Object.keys(assetsByCategory) as AssetCategory[]).map((category) => {
              const categoryAssets = assetsByCategory[category];
              if (categoryAssets.length === 0) return null;

              const Icon = CATEGORY_ICONS[category];

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2 lg:mb-3">
                    <Icon className="w-4 h-4 text-dark-400" />
                    <h4 className="text-sm lg:text-base font-medium text-dark-300">
                      {ASSET_CATEGORY_LABELS[category]}
                    </h4>
                    <span className="text-xs text-dark-500">({categoryAssets.length})</span>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    {categoryAssets.map((asset) => {
                      const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : null;
                      const hasPurchaseValue = asset.purchaseValue !== undefined && asset.purchaseValue > 0;
                      const valueDiff = hasPurchaseValue ? asset.currentValue - asset.purchaseValue! : 0;
                      const valueChangePercent = hasPurchaseValue && asset.purchaseValue! > 0
                        ? ((valueDiff / asset.purchaseValue!) * 100).toFixed(1)
                        : '0';

                      return (
                        <div
                          key={asset.id}
                          className="p-3 lg:p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-dark-600 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2 lg:mb-3">
                            <div className="min-w-0 flex-1">
                              <h5 className="text-sm lg:text-lg font-semibold text-dark-100 truncate">{asset.name}</h5>
                              {asset.description && (
                                <p className="text-xs lg:text-sm text-dark-400 truncate">{asset.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(asset)}
                                className="p-1.5 lg:p-2 text-dark-400 hover:text-dark-100 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(asset.id, asset.name)}
                                className="p-1.5 lg:p-2 text-dark-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-2 lg:gap-4 grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">현재 가치</p>
                              <p className="text-xs lg:text-base font-medium text-emerald-400 truncate">
                                {formatAmount(asset.currentValue)}
                              </p>
                            </div>
                            {hasPurchaseValue && (
                              <>
                                <div>
                                  <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">취득가</p>
                                  <p className="text-xs lg:text-base font-medium text-dark-300 truncate">
                                    {formatAmount(asset.purchaseValue!)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">변동</p>
                                  <p className={`text-xs lg:text-base font-medium truncate ${valueDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {valueDiff >= 0 ? '+' : ''}{formatAmount(valueDiff)} ({valueDiff >= 0 ? '+' : ''}{valueChangePercent}%)
                                  </p>
                                </div>
                              </>
                            )}
                            {purchaseDate && (
                              <div>
                                <p className="text-[10px] lg:text-xs text-dark-500 mb-0.5 lg:mb-1">취득일</p>
                                <p className="text-xs lg:text-base font-medium text-dark-300 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 hidden lg:inline" />
                                  {purchaseDate.getFullYear()}.{purchaseDate.getMonth() + 1}.{purchaseDate.getDate()}
                                </p>
                              </div>
                            )}
                          </div>

                          {asset.memo && (
                            <p className="mt-2 lg:mt-3 text-xs lg:text-sm text-dark-500">{asset.memo}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <AssetForm asset={editingAsset} onClose={handleCloseForm} />
      )}
    </div>
  );
}
