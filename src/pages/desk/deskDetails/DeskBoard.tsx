import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import {TaskBoard} from '../../tasks/components/TaskBoard'

type ContextType = {
	desk: DeskData;
}

export const DeskBoard = () => {
	const { desk } = useOutletContext<ContextType>();


	return (
		<div className="h-100% flex flex-col bg-gray-100">
			{/* Заголовок доски */}


			{/* Передаем ID доски как число, с проверкой на undefined */}
			<TaskBoard deskId={desk.id} />
		</div>
	);
};