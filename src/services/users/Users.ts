import {getAllUsers} from './api/GetUsers'
import {addUserForDesk} from './api/AddUserForDesk'
import {getUsersOnDesk} from './api/GetUsersOnDesk'
import {handleUserError} from './utils/errorHandlers'

// Экспортируем сервис
export const UserService = {
	handleError: handleUserError,
	getAllUsers,
	addUserForDesk,
	getUsersOnDesk
};