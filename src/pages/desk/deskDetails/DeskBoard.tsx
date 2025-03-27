import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import {TaskBoard} from '../../tasks/components/TaskBoard'

type ContextType = {
	desk: DeskData;
}

export const DeskBoard = () => {
	const { desk } = useOutletContext<ContextType>();

	// Добавим проверку и вывод ID для отладки
	console.log('DeskBoard: ID доски:', desk?.id);

	return (
		<div className="h-full flex flex-col">
			{/* Заголовок доски */}
			<div className="p-4 border-b">
				<h2 className="text-lg font-medium">{desk?.deskName || 'Доска задач'}</h2>
				<div className="text-sm text-gray-500">ID: {desk?.id || 'Загрузка...'}</div>
			</div>

			{/* Передаем ID доски как число, с проверкой на undefined */}
			<TaskBoard deskId={desk.id} />
		</div>
	);
};