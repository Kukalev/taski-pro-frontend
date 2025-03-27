import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import {TaskBoard} from '../../tasks/components/TaskBoard'

type ContextType = {
	desk: DeskData;
}

export const DeskBoard = () => {
	const { desk } = useOutletContext<ContextType>();


	return (
		<div className="h-full flex flex-col">
			{/* Заголовок доски */}


			{/* Передаем ID доски как число, с проверкой на undefined */}
			<TaskBoard deskId={desk.id} />
		</div>
	);
};