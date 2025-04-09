import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GptService } from '../../../../../services/Gpt/Gpt';
import { GptRecommendationResponse, GptRecommendationStatus } from '../../../../../services/Gpt/types';
import { GptProps } from '../types'; // Импортируем пропсы из основного файла типов
import { FaBrain, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const POLLING_INTERVAL = 3000; // Интервал поллинга в миллисекундах (3 секунды)

const Gpt: React.FC<GptProps> = ({ deskId, taskId, canRequestAiHelp }) => {
	const [recommendation, setRecommendation] = useState<GptRecommendationResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

	const clearPollingTimer = () => {
		if (pollingTimerRef.current) {
			clearTimeout(pollingTimerRef.current);
			pollingTimerRef.current = null;
		}
	};

	const fetchRecommendation = useCallback(async (isInitialRequest = false) => {
		if (isInitialRequest) {
			setRecommendation(null);
			setIsLoading(true);
			setIsPolling(false);
			setError(null);
		} else {
			// При поллинге isLoading уже false, isPolling = true
		}
		
		clearPollingTimer();

		try {
			const response = await GptService.getAiRecommendation(deskId, taskId);
			setRecommendation(response);
			setIsLoading(false);

			if (response.status === 'waiting') {
				setIsPolling(true);
				pollingTimerRef.current = setTimeout(() => fetchRecommendation(false), POLLING_INTERVAL);
			} else {
				setIsPolling(false);
				if (response.status === 'error' && !response.text) {
					setError('Произошла ошибка при получении рекомендации от AI.');
				}
			}
		} catch (err: any) {
			console.error("Ошибка при запросе AI рекомендации:", err);
			setError(err.message || 'Не удалось получить рекомендацию от AI.');
			setIsLoading(false);
			setIsPolling(false);
		}
	}, [deskId, taskId, canRequestAiHelp]);

	useEffect(() => {
		if (canRequestAiHelp && deskId && taskId) {
			fetchRecommendation(true);
		} else {
			setIsLoading(false);
			setIsPolling(false);
			setError(null);
			setRecommendation(null);
		}

		return () => {
			clearPollingTimer();
		};
	}, [deskId, taskId, canRequestAiHelp, fetchRecommendation]);

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
			return <div className="flex items-center text-red-600"><FaExclamationCircle className="mr-2" /> {error}</div>;
		}
		if (recommendation?.status === 'success' && recommendation.text) {
			return (
				<div className="flex items-start text-green-700">
					<FaCheckCircle className="mr-2 mt-1 flex-shrink-0" />
					<p className="text-sm">{recommendation.text}</p>
				</div>
			);
		}
		if (recommendation?.status === 'error' && recommendation.text) {
			return (
				<div className="flex items-start text-yellow-600">
					<FaExclamationCircle className="mr-2 mt-1 flex-shrink-0" />
					<p className="text-sm">{recommendation.text}</p> 
				</div>
			);
		}
		return <div className="text-gray-500 italic">Не удалось получить ответ от AI.</div>;
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
