import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import TaskBoardPage from '../../TaskBoard/TaskBoardPage.tsx'

type ContextType = {
	desk: DeskData;
}

export const DeskBoard = () => {
	const { desk } = useOutletContext<ContextType>();


	return (
		<div className="h-100% flex flex-col bg-gray-100">
			{/* Заголовок доски */}


			{/* Передаем ID доски как число, с проверкой на undefined */}
			<TaskBoardPage deskId={desk.id} />
		</div>
	);
};