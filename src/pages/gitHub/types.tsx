// Импортируем DeskData, так как он используется в интерфейсе
import {DeskData} from '../../components/sidebar/types/sidebar.types'

// Экспортируем интерфейс, чтобы его можно было импортировать в других файлах
export interface DeskDetailsContext {
	desk: DeskData;
	hasEditPermission: boolean;
	// Можно добавить и другие поля из контекста Outlet, если они нужны здесь,
	// например, refreshDesk, deskUsers
}