export interface DeskDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onClose: () => void;
  isVisible: boolean;
}

export interface CalendarHeaderProps {
  currentMonth: Date;
  prevMonth: () => void;
  nextMonth: () => void;
}

export interface WeekdaysHeaderProps {
  daysOfWeek: string[];
}

export interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  handleSelectDate: (date: Date) => void;
}

export interface CalendarFooterProps {
  onClear: () => void;
  onSelectToday: () => void;
}

