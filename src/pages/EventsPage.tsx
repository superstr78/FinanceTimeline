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
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-dark-400 text-sm mb-1">전체 이벤트</p>
          <p className="text-2xl font-bold text-dark-100">{stats.total}개</p>
        </div>
        <div className="card">
          <p className="text-dark-400 text-sm mb-1">중요 이벤트</p>
          <p className="text-2xl font-bold text-amber-400">{stats.importantCount}개</p>
        </div>
        <div className="card col-span-2">
          <p className="text-dark-400 text-sm mb-2">카테고리별</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-300"
              >
                {EVENT_CATEGORY_LABELS[cat]}: {stats.categoryCounts[cat] || 0}
              </span>
            ))}
          </div>
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
            placeholder="이벤트 검색..."
            className="input pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* 카테고리 필터 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="input py-2"
          >
            <option value="all">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {EVENT_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* 추가 버튼 */}
          <button
            onClick={handleAdd}
            className="btn bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="w-4 h-4" />
            이벤트 추가
          </button>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="card !p-0 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-dark-500">
            {searchQuery || filterCategory !== 'all'
              ? '검색 결과가 없습니다'
              : '등록된 이벤트가 없습니다. 이벤트를 추가해보세요!'}
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {filteredEvents.map((e) => (
              <div
                key={e.id}
                className={`flex items-center gap-4 p-4 hover:bg-dark-800/50 transition-colors ${EVENT_BG_CLASSES[e.color]}`}
              >
                {/* 색상 인디케이터 */}
                <div className={`w-1 h-12 rounded-full ${EVENT_COLOR_CLASSES[e.color]}`} />

                {/* 아이콘 */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${EVENT_COLOR_CLASSES[e.color]}/20`}>
                  {e.isImportant ? (
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ) : (
                    <Calendar className="w-5 h-5 text-dark-300" />
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-dark-100 truncate">{e.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${EVENT_COLOR_CLASSES[e.color]}/20 text-dark-300`}>
                      {EVENT_CATEGORY_LABELS[e.category]}
                    </span>
                    {e.isImportant && (
                      <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-xs text-amber-400">
                        중요
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-500">
                    <span>{formatDate(e.date)}</span>
                    {e.description && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[300px]">{e.description}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(e)}
                    className="p-2 text-dark-500 hover:text-dark-200 transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id, e.title)}
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
