import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Star, Calendar } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EventForm } from '../components/events/EventForm';
import {
  EVENT_CATEGORY_LABELS,
  EVENT_COLOR_CLASSES,
  EVENT_BG_CLASSES,
  type LifeEvent,
  type EventCategory,
} from '../types';

type FilterCategory = 'all' | EventCategory;

export function EventsPage() {
  const { events, deleteEvent } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 이벤트 목록
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // 카테고리 필터
        if (filterCategory !== 'all' && e.category !== filterCategory) return false;
        // 검색 필터
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            e.title.toLowerCase().includes(query) ||
            EVENT_CATEGORY_LABELS[e.category].toLowerCase().includes(query) ||
            (e.description && e.description.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filterCategory, searchQuery]);

  // 카테고리별 통계
  const stats = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    let importantCount = 0;

    events.forEach((e) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
      if (e.isImportant) importantCount++;
    });

    return { categoryCounts, importantCount, total: events.length };
  }, [events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleEdit = (event: LifeEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`"${title}" 이벤트를 삭제하시겠습니까?`)) {
      deleteEvent(id);
    }
  };

  const categories: EventCategory[] = ['housing', 'contract', 'career', 'family', 'education', 'other'];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-2 lg:gap-4">
        <div className="card !p-3 lg:!p-6">
          <p className="text-dark-400 text-xs lg:text-sm mb-1">전체</p>
          <p className="text-xl lg:text-2xl font-bold text-dark-100">{stats.total}개</p>
        </div>
        <div className="card !p-3 lg:!p-6">
          <p className="text-dark-400 text-xs lg:text-sm mb-1">중요</p>
          <p className="text-xl lg:text-2xl font-bold text-amber-400">{stats.importantCount}개</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="space-y-3">
        {/* 검색 + 추가 버튼 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="input pl-10 w-full text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            className="btn bg-purple-500 hover:bg-purple-600 text-white whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">추가</span>
          </button>
        </div>

        {/* 카테고리 필터 */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
          className="input py-2 text-sm w-full sm:w-auto"
        >
          <option value="all">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {EVENT_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* 이벤트 목록 */}
      <div className="card !p-0 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 lg:py-12 text-dark-500 text-sm">
            {searchQuery || filterCategory !== 'all'
              ? '검색 결과가 없습니다'
              : '등록된 이벤트가 없습니다. 이벤트를 추가해보세요!'}
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {filteredEvents.map((e) => (
              <div
                key={e.id}
                className={`flex items-start lg:items-center gap-3 p-3 lg:p-4 hover:bg-dark-800/50 transition-colors ${EVENT_BG_CLASSES[e.color]}`}
              >
                {/* 색상 인디케이터 */}
                <div className={`w-1 h-10 lg:h-12 rounded-full flex-shrink-0 ${EVENT_COLOR_CLASSES[e.color]}`} />

                {/* 아이콘 - 모바일에서 숨김 */}
                <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 ${EVENT_COLOR_CLASSES[e.color]}/20`}>
                  {e.isImportant ? (
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ) : (
                    <Calendar className="w-5 h-5 text-dark-300" />
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 lg:gap-2 mb-0.5 lg:mb-1 flex-wrap">
                    <h3 className="font-medium text-dark-100 truncate text-sm lg:text-base">{e.title}</h3>
                    {e.isImportant && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 sm:hidden flex-shrink-0" />
                    )}
                    <span className={`hidden sm:inline px-2 py-0.5 rounded-full text-xs ${EVENT_COLOR_CLASSES[e.color]}/20 text-dark-300`}>
                      {EVENT_CATEGORY_LABELS[e.category]}
                    </span>
                    {e.isImportant && (
                      <span className="hidden sm:inline px-2 py-0.5 bg-amber-500/20 rounded-full text-xs text-amber-400">
                        중요
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-dark-500 flex-wrap">
                    <span>{formatDate(e.date)}</span>
                    <span className="sm:hidden">· {EVENT_CATEGORY_LABELS[e.category]}</span>
                    {e.description && (
                      <>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline truncate max-w-[300px]">{e.description}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(e)}
                    className="p-1.5 lg:p-2 text-dark-500 hover:text-dark-200 transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id, e.title)}
                    className="p-1.5 lg:p-2 text-dark-500 hover:text-rose-400 transition-colors"
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

      {/* 이벤트 수 표시 */}
      <div className="text-center text-sm text-dark-500">
        총 {filteredEvents.length}개의 이벤트
        {filterCategory !== 'all' && ` (${EVENT_CATEGORY_LABELS[filterCategory]})`}
      </div>

      {/* 이벤트 추가/수정 폼 */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
