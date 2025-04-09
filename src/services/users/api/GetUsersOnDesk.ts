import api from '../../api'
import {UsersOnDeskResponseDto} from '../types/types'

const BASE_URL = '/v1/desk';

// Кэш для хранения пользователей по доскам
const usersCache: Record<number, UsersOnDeskResponseDto[]> = {};

// Функция для очистки кэша конкретной доски
export const invalidateDeskUsersCache = (deskId: number) => {
	if (usersCache[deskId]) {
		delete usersCache[deskId];
		console.log(`Кэш пользователей для доски ${deskId} очищен`);
	}
};

// Функция для полной очистки кэша всех досок
export const clearAllUsersCache = () => {
	Object.keys(usersCache).forEach(key => {
		delete usersCache[parseInt(key)];
	});
	console.log('Весь кэш пользователей очищен');
};

export const getUsersOnDesk = async (deskId: number, forceRefresh = false): Promise<UsersOnDeskResponseDto[]> => {
	try {
		// Проверяем, есть ли данные в кэше и не требуется ли принудительное обновление
		if (!forceRefresh && usersCache[deskId]) {
			console.log(`Возвращаем кэшированных пользователей для доски ${deskId}`);
			return usersCache[deskId];
		}
		
		console.log(`Запрос пользователей для доски ${deskId} по URL: ${BASE_URL}/${deskId}/users`);
		const response = await api.get<UsersOnDeskResponseDto[]>(`${BASE_URL}/${deskId}/users`);
		console.log('Ответ API пользователей на доске:', response);
		console.log('Данные пользователей на доске:', response.data);

		// Если ответ пустой массив или undefined, возвращаем пустой массив
		if (!response.data || response.data.length === 0) {
			console.warn("API вернул пустой массив пользователей");
			usersCache[deskId] = [];
			return [];
		}

		// Преобразуем данные пользователей, конвертируя userName в username
		const transformedUsers = response.data.map(user => {
			// Если есть userName, создаем новый объект с username
			if (user.userName) {
				return {
					...user,
					username: user.userName,
					// НЕ удаляем старое поле userName, так как оно может использоваться в других компонентах
				};
			}
			return user;
		});

		// Проверяем, что каждый элемент массива имеет поле username
		const validUsers = transformedUsers.filter(user => {
			// Если объект пользователя имеет поле username или userName, используем его
			if (user.username || user.userName) {
				return true;
			}

			console.warn('Пользователь без username:', user);
			return false;
		});

		console.log('Отфильтрованные пользователи:', validUsers);
		
		// Сохраняем в кэш
		usersCache[deskId] = validUsers;
		
		return validUsers;
	} catch (error) {
		console.error('Ошибка при получении пользователей доски:', error);
		return [];
	}
};