export interface TaskDatePickerProps {
  taskId: string;
  selectedDate: Date | null;
  onDateChange: (taskId: string, date: Date | null) => void;
  onClose: () => void;
}
