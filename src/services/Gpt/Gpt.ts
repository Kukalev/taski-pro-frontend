import api from '../api' // Импортируем основной инстанс Axios
import {GptRecommendationRequest, GptRecommendationResponse} from './types'

// Базовый URL для эндпоинтов задач внутри доски
const BASE_URL = '/v1/desk';


export const getAiRecommendation = async (
	deskId: number,
	taskId: number,
	currentTime?: Date | string | null
): Promise<GptRecommendationResponse> => {
	const url = `${BASE_URL}/${deskId}/tasks/${taskId}/aihelp`;
	console.log(`[GptService.getAiRecommendation] Запрос AI помощи для задачи ${taskId} в доске ${deskId}. URL: ${url}`);

	let requestBody: GptRecommendationRequest | undefined = undefined;

	// Если currentTime передано, формируем тело запроса
	if (currentTime) {
		const timeString = currentTime instanceof Date ? currentTime.toISOString() : currentTime;
		requestBody = { currentTime: timeString };
		console.log(`[GptService.getAiRecommendation] Отправляем currentTime:`, requestBody);
	} else {
		console.log(`[GptService.getAiRecommendation] currentTime не указано, тело запроса не отправляется.`);
	}

	try {
		// Используем api.get, передавая необязательные данные через config.data
		// Хотя GET с телом - не стандарт REST, Spring и Axios это позволяют
		const response = await api.get<GptRecommendationResponse>(url, {
			// Передаем тело запроса только если оно сформировано
			...(requestBody && { data: requestBody }),
		});
		console.log('[GptService.getAiRecommendation] Ответ сервера:', response.data);
		return response.data;
	} catch (error) {
		console.error(`[GptService.getAiRecommendation] Ошибка при получении AI рекомендации для задачи ${taskId}:`, error);
		// Пробрасываем ошибку, чтобы компонент мог её обработать (например, показать уведомление)
		throw error;
	}
};

// Группируем функции в сервис для удобного импорта
export const GptService = {
	getAiRecommendation,
};


