import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

// 한국어 로케일 등록
registerLocale('ko', ko);

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = '날짜 선택', className = '' }: DatePickerProps) {
  const selectedDate = value ? new Date(value) : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        locale="ko"
        placeholderText={placeholder}
        className="input w-full text-sm lg:text-base pr-10"
        calendarClassName="dark-calendar"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        isClearable
        todayButton="오늘"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100 pointer-events-none" />
    </div>
  );
}
