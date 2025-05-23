import React, {useCallback, useEffect, useRef, useState} from 'react'
import {GptService} from '../../../../../services/Gpt/Gpt'
import {GptRecommendationResponse, GptRecommendationStatus} from '../../../../../services/Gpt/types'
import {GptProps} from '../types' // Импортируем пропсы из основного файла типов
import {
	FaBrain,
	FaCheckCircle,
	FaExclamationCircle,
	FaSpinner
} from 'react-icons/fa'

const POLLING_INTERVAL = 1500; // Интервал поллинга в миллисекундах (1.5 секунды)
const REFETCH_DEBOUNCE_DELAY = 1000; // Задержка перед перезапросом (1 секунда)

const Gpt: React.FC<GptProps> = ({ deskId, taskId, canRequestAiHelp, taskName, taskDescription, taskStack }) => {
	const [recommendation, setRecommendation] = useState<GptRecommendationResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const clearPollingTimer = () => {
		if (pollingTimerRef.current) {
			clearTimeout(pollingTimerRef.current);
			pollingTimerRef.current = null;
		}
	};

	const clearDebounceTimer = () => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
	};

	const fetchRecommendation = useCallback(async (isInitialRequest = false) => {
		if (!deskId || !taskId) {
			setError('ID доски или задачи не определены.');
			setIsLoading(false);
			return;
		}

		if (isInitialRequest) {
			console.log('[Gpt fetchRecommendation] Initial request, resetting state.');
			setRecommendation(null);
			setIsLoading(true);
			setIsPolling(false);
			setError(null);
		}

		clearPollingTimer();

		try {
			const now = new Date().toISOString();
			console.log(`[Gpt fetchRecommendation] Вызов API с currentTime: ${now}`);
			const response = await GptService.getAiRecommendation(deskId, taskId, now);
			console.log('[Gpt fetchRecommendation] Получен ответ API:', response);
			setRecommendation(response);
			setIsLoading(false);

			if (response.status === 'waiting') {
				console.log('[Gpt fetchRecommendation] Статус waiting, запускаем поллинг.');
				setIsPolling(true);
				pollingTimerRef.current = setTimeout(() => fetchRecommendation(false), POLLING_INTERVAL);
			} else {
				setIsPolling(false);
				if (response.status === 'error' && !response.text) {
					setError('Произошла ошибка при получении рекомендации от AI.');
				}
			}
		} catch (err: any) {
			console.error("[Gpt fetchRecommendation] Ошибка API:", err);
			setError(err.response?.data?.message || err.message || 'Не удалось получить рекомендацию от AI.');
			setIsLoading(false);
			setIsPolling(false);
		}
	}, [deskId, taskId]);

	useEffect(() => {
		console.log('[Gpt useEffect] Запуск. Зависимости:', { deskId, taskId, canRequestAiHelp, taskName, taskDescription, taskStack });
		clearDebounceTimer();

		if (canRequestAiHelp && deskId && taskId) {
			console.log('[Gpt useEffect] Установка таймера debounce...');
			debounceTimerRef.current = setTimeout(() => {
				console.log('[Gpt setTimeout] Таймер сработал! Вызов fetchRecommendation.');
				fetchRecommendation(true);
			}, REFETCH_DEBOUNCE_DELAY);
		} else {
			console.log('[Gpt useEffect] Пропуск/сброс состояния AI.');
			setIsLoading(false);
			setIsPolling(false);
			setError(null);
			setRecommendation(null);
			clearPollingTimer();
			if (!canRequestAiHelp) {
				console.log('[Gpt Component] Помощь AI недоступна.');
			}
		}

		return () => {
			console.log('[Gpt useEffect] Очистка таймеров.');
			clearPollingTimer();
			clearDebounceTimer();
		};
	}, [deskId, taskId, canRequestAiHelp, taskName, taskDescription, taskStack, fetchRecommendation]);

	const renderContent = () => {
		if (!canRequestAiHelp) {
			return <div className="text-xs text-gray-400 italic">Помощь AI недоступна для этой задачи или у вас нет прав.</div>;
		}
		if (isLoading) {
			return <div className="flex items-center text-gray-500"><FaSpinner className="animate-spin mr-2" /> Запрашиваем помощь AI...</div>;
		}
		if (isPolling) {
			return <div className="flex items-center text-blue-600"><FaSpinner className="animate-spin mr-2" /> Ожидание ответа AI...</div>;
		}
		if (error) {
			return <div className="flex items-center text-gray-500"><FaExclamationCircle className="mr-2" /> Дополните стек или описание для ответа gpt</div>;
		}
		if (recommendation?.status === 'error') {
			return (
				<div className="flex items-start text-yellow-600">
					<FaExclamationCircle className="mr-2 mt-1 flex-shrink-0" />
					<p className="text-sm">Дополните стек или описание для ответь gpt</p>
				</div>
			);
		}
		if (recommendation?.status === 'success' && recommendation.text) {
			return (
				<div className="flex items-start text-green-700">
					<FaCheckCircle className="mr-2 mt-1 flex-shrink-0" />
					<p className="text-sm">{recommendation.text}</p>
				</div>
			);
		}
		if (recommendation?.status === 'waiting') {
			return <div className="flex items-center text-blue-600"><FaSpinner className="animate-spin mr-2" /> Ожидание ответа AI...</div>;
		}
		return <div className="text-gray-500 italic">Не удалось получить ответ от AI или ответ пуст.</div>;
	};

	return (
		<div className="py-4 border-t border-gray-200">
			<h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
				<FaBrain className="mr-2" /> Помощь AI
			</h3>
			<div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 min-h-[60px]">
				{renderContent()}
			</div>
		</div>
	);
};

export default Gpt;
