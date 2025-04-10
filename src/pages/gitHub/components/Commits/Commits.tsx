// src/pages/gitHub/components/Commits/Commits.tsx
import React from 'react'
import {CommitsListProps} from './types'
import {ThemedButton} from '../../../../components/ui/ThemedButton'

// Функция для определения тега/типа коммита на основе текста сообщения
const getCommitTag = (message?: string): { text: string; color: string } => {
	// Проверка на существование сообщения
	if (!message) {
		return { text: 'commit', color: 'bg-gray-100 text-gray-800' };
	}
	
	const lowerMessage = message.toLowerCase();
	
	if (lowerMessage.includes('fix') || lowerMessage.includes('исправлен')) {
		return { text: 'fix', color: 'bg-yellow-100 text-yellow-800' };
	} else if (lowerMessage.includes('feature') || lowerMessage.includes('добавлен')) {
		return { text: 'feature', color: 'bg-green-100 text-green-800' };
	} else if (lowerMessage.includes('ui') || lowerMessage.includes('интерфейс')) {
		return { text: 'ui', color: 'bg-blue-100 text-blue-800' };
	} else if (lowerMessage.includes('refactor') || lowerMessage.includes('рефакторинг')) {
		return { text: 'refactor', color: 'bg-indigo-100 text-indigo-800' };
	} else if (lowerMessage.includes('test') || lowerMessage.includes('тест')) {
		return { text: 'test', color: 'bg-purple-100 text-purple-800' };
	} else if (lowerMessage.includes('docs') || lowerMessage.includes('документац')) {
		return { text: 'docs', color: 'bg-gray-100 text-gray-800' };
	} else if (lowerMessage.includes('api') || lowerMessage.includes('сервис')) {
		return { text: 'api-service', color: 'bg-blue-100 text-blue-800' };
	}
	
	return { text: 'commit', color: 'bg-gray-100 text-gray-800' };
};

// Функция для форматирования хэша коммита
const formatCommitHash = (hash: string): string => {
	if (!hash) return 'xxxxxxx';
	return hash.substring(0, 7);
};

export const CommitsList: React.FC<CommitsListProps> = ({
	commits,
	selectedRepo,
	loading,
	error,
	onBack,
}) => {
	if (loading) {
		return (
			<div className="flex justify-center items-center h-40">
				<div className="loader animate-pulse flex flex-col items-center">
					<svg className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
					</svg>
					<p className="mt-3 text-gray-500">Загрузка коммитов...</p>
				</div>
			</div>
		);
	}

	if (error) {
		// Ошибку отображаем в родительском компоненте
		return null;
	}

	if (!selectedRepo) {
		return <p>Репозиторий не выбран.</p> // На всякий случай
	}

	// Получаем короткую версию URL
	const repoName = selectedRepo.repositoryUrl
		? new URL(selectedRepo.repositoryUrl).pathname.substring(1)
		: "Репозиторий";

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 flex-shrink-0">
				<div className="mb-2 md:mb-0">
					<h3 className="text-lg font-semibold mb-1 flex items-center">
						<svg className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
						</svg>
						{repoName}
					</h3>
					<div className="flex items-center text-sm text-gray-500">
						<span className="flex items-center mr-4">
							<svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M2 16s4-8 10-8 10 8 10 8M2 12h20M12 2v5M12 17v5"/>
							</svg>
							<a 
								href={selectedRepo.repositoryUrl} 
								target="_blank" 
								rel="noopener noreferrer" 
								className="text-blue-600 hover:underline"
							>
								Открыть на GitHub
							</a>
						</span>
						<span className="flex items-center">
							<svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M6 3v12"></path>
								<circle cx="18" cy="6" r="3"></circle>
								<circle cx="6" cy="18" r="3"></circle>
								<path d="M18 9v2a2 2 0 0 1-2 2h-3M6 12l3 3"></path>
							</svg>
							Ветка: {selectedRepo.branchName}
						</span>
					</div>
				</div>

				<ThemedButton
					onClick={onBack}
					className="py-2 px-4 rounded flex items-center text-sm flex-shrink-0"
				>
					<svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Назад к репозиториям
				</ThemedButton>
			</div>

			{commits.length > 0 ? (
				<div className="overflow-y-auto pr-2 snap-y snap-mandatory flex-grow max-h-[calc(100vh-16rem)]">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{commits.map((commit) => {
							const commitTag = getCommitTag(commit.shortMessage || commit.commitMessage);
							const commitUrl = commit.commitUrl;

							const title = commit.shortMessage || commit.commitMessage?.split('\n')[0] || 'Нет описания';

							return (
								<a 
									key={commit.id} 
									href={commitUrl || '#'}
									target={commitUrl ? "_blank" : undefined}
									rel="noopener noreferrer"
									className={`block snap-start ${commitUrl ? 'cursor-pointer' : 'cursor-default'}`}
								>
									<div className="border rounded shadow-sm hover:shadow-md transition-all duration-200 h-50 bg-white overflow-hidden h-40 flex flex-col justify-between hover:border-blue-400">
										<div className="px-4 py-3 border-b">
											<div className="flex items-center mb-2 flex-grow">
												{commit.authorAvatarUrl ? (
													<img 
														src={commit.authorAvatarUrl} 
														alt={commit.authorName || 'Автор'} 
														className="w-8 h-8 rounded-full mr-3"
													/>
												) : (
													<div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-sm font-bold text-gray-700">
														{commit.authorName ? commit.authorName.charAt(0).toUpperCase() : '?'}
													</div>
												)}
												<div className="flex-1 overflow-hidden">
													<div className="font-medium text-sm truncate">{commit.authorName || 'Неизвестно'}</div>
													<div className="text-xs text-gray-500 truncate">{commit.authorEmail || 'Нет email'}</div>
												</div>
												<div className={`text-xs px-2 py-1 rounded-full ${commitTag.color} ml-2 flex-shrink-0`}>
													{commitTag.text}
												</div>
											</div>
										</div>
										
										<div className="p-4 flex flex-col flex-grow">
											<h4 className="text-sm font-medium mb-1 line-clamp-2" title={title}>
												{title}
											</h4>
											<div className="mt-auto flex justify-between items-center text-xs text-gray-500 pt-2">
												<div>{commit.commitDate ? new Date(commit.commitDate).toLocaleDateString() + ' ' + new Date(commit.commitDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Дата неизвестна'}</div>
												<div className="font-mono bg-gray-100 px-2 py-1 rounded">{formatCommitHash(commit.commitHash)}</div>
											</div>
										</div>
									</div>
								</a>
							);
						})}
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg flex-grow">
					<svg className="h-16 w-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
					</svg>
					<p className="text-gray-500 mb-2">Нет коммитов для отображения</p>
					<p className="text-gray-400 text-sm">Попробуйте синхронизировать репозиторий или выбрать другую ветку</p>
				</div>
			)}
		</div>
	);
};