/**
 * Тип для необязательного тела запроса к эндпоинту /aihelp.
 * currentTime должен быть строкой в формате ISO 8601, если передается.
 */
export interface GptRecommendationRequest {
	currentTime?: string; // LocalDateTime на бэкенде преобразуется в ISO строку
}

/**
 * Возможные статусы ответа от эндпоинта /aihelp.
 */
export type GptRecommendationStatus = 'success' | 'waiting' | 'error';

/**
 * Тип ответа от эндпоинта /aihelp.
 */
export interface GptRecommendationResponse {
	text: string;
	status: GptRecommendationStatus;
}
