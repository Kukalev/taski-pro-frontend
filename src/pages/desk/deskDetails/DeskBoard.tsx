import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import TaskBoardPage from '../../TaskBoard/TaskBoardPage.tsx'
import { UserOnDesk } from '../../DeskOverview/components/DeskParticipants/types'

type ContextType = {
	desk: DeskData;
	deskUsers: UserOnDesk[];
}

export const DeskBoard = () => {
	const { desk, deskUsers } = useOutletContext<ContextType>();

	if (!desk || typeof desk.id !== 'number') {
		return <div className="p-4">Загрузка данных доски...</div>;
	}

	return (
		<div className="h-full flex flex-col">
			<TaskBoardPage 
				deskId={desk.id}
				deskUsers={deskUsers}
			/>
		</div>
	);
};