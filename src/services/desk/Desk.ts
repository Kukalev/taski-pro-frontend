import { createDesk } from './api/createDesk'
import { deleteDesk } from './api/deleteDesk'
import { getAllDesks } from './api/getAllDesks'
import { getDeskById } from './api/getDeskById'
import { updateDesk } from './api/updateDesk'
import { handleDeskError } from './utils/errorHandlers'

// Экспортируем сервис
export const DeskService = {
	handleError: handleDeskError,
	createDesk,
	deleteDesk,
	getDeskById,
	updateDesk,
	getAllDesks
}
