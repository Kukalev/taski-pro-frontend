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
}; 