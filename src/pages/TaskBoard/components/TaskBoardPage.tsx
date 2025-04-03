import { useParams } from 'react-router-dom';
import { useTaskActions } from '../hooks/useTaskActions';

const TaskBoardPage = () => {
  const { deskId: urlDeskId } = useParams<{ deskId: string }>();
  const deskIdNumber = urlDeskId ? parseInt(urlDeskId, 10) : null;
  
  // Добавляем прямую передачу deskId в TaskColumn
  
  // ... остальной код
  
  // При рендеринге TaskColumn, передаем deskId:
  // <TaskColumn ... deskId={deskIdNumber} />
  
  // ... остальной код

  // Клик по иконке даты
  const handleDateClick = (taskId: number) => {
    // Закрываем календарь в TaskDetails если он открыт
    if (selectedTask && selectedTask.taskId === taskId) {
      // Закрываем календарь в TaskDetails через соответствующий интерфейс,
      // если он будет разработан. Сейчас это не требуется - компонент управляет сам
      // своим календарем
    }
    
    // Открываем/закрываем календарь рядом с карточкой задачи
    setDatePickerTaskId(datePickerTaskId === taskId ? null : taskId);
  };
}; 