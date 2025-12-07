import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../store/AppContext';
import { DatePicker } from '../common/DatePicker';
import {
  EVENT_CATEGORY_LABELS,
  EVENT_COLOR_CLASSES,
  type LifeEvent,
  type EventCategory,
  type EventColor,
} from '../../types';

interface EventFormProps {
  event?: LifeEvent | null;
  onClose: () => void;
}

const categories: EventCategory[] = ['housing', 'contract', 'career', 'family', 'education', 'other'];
const colors: EventColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

export function EventForm({ event, onClose }: EventFormProps) {
  const { addEvent, updateEvent, currentYear, currentMonth } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('other');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [color, setColor] = useState<EventColor>('blue');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setCategory(event.category);
      setDate(event.date);
      setDescription(event.description || '');
      setIsImportant(event.isImportant);
      setColor(event.color);
    } else {
      setDate(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    }
  }, [event, currentYear, currentMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const data: LifeEvent = {
      id: event?.id || uuidv4(),
      title: title.trim(),
      category,
      date,
      description: description.trim() || undefined,
      isImportant,
      color,
      createdAt: event?.createdAt || new Date().toISOString(),
    };

    if (event) {
      updateEvent(event.id, data);
    } else {
      addEvent(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="card w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-b-2xl">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-dark-100">
            {event ? '이벤트 수정' : '새 이벤트 추가'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              이벤트 제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 전세 만기, 입주, 계약 갱신"
              className="input text-sm lg:text-base"
              autoFocus
            />
          </div>

          {/* 카테고리 & 날짜 */}
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="input text-sm lg:text-base"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {EVENT_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
                날짜 *
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="날짜 선택"
              />
            </div>
          </div>

          {/* 색상 & 중요 */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
                색상
              </label>
              <div className="flex gap-1.5 lg:gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full ${EVENT_COLOR_CLASSES[c]} transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-offset-dark-900 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-0.5">
              <button
                type="button"
                onClick={() => setIsImportant(!isImportant)}
                className={`p-1.5 lg:p-2 rounded-lg transition-all ${
                  isImportant
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-dark-800 text-dark-500 hover:text-dark-300'
                }`}
              >
                <Star className={`w-4 h-4 lg:w-5 lg:h-5 ${isImportant ? 'fill-current' : ''}`} />
              </button>
              <span className="text-xs lg:text-sm text-dark-300">
                중요
              </span>
            </label>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark-300 mb-1.5 lg:mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 설명 (선택)"
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
              className={`btn flex-1 text-white text-sm lg:text-base ${EVENT_COLOR_CLASSES[color]} hover:opacity-90`}
            >
              {event ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
