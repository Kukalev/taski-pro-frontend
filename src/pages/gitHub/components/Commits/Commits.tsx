// src/pages/gitHub/components/Commits/Commits.tsx
import React from 'react'
import {CommitsListProps} from './types'
import { ThemedButton } from '../../../../components/ui/ThemedButton'

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
		<div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<div className="mb-4 md:mb-0">
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
					className="py-2 px-4 rounded flex items-center text-sm"
				>
					<svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Назад к репозиториям
				</ThemedButton>
			</div>

			{commits.length > 0 ? (
				<div className="grid grid-cols-1 gap-4">
					{commits.map((commit) => (
						<div key={commit.id} className="border rounded shadow-sm hover:shadow transition-shadow duration-200 bg-white overflow-hidden">
							<div className="border-b bg-gray-50 px-4 py-3 flex justify-between items-center">
								<div className="flex items-center">
									{commit.authorAvatarUrl ? (
										<img 
											src={commit.authorAvatarUrl} 
											alt={commit.authorName} 
											className="w-6 h-6 rounded-full mr-2"
										/>
									) : (
										<div className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-xs font-bold text-gray-800">
											{commit.authorName && commit.authorName.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<span className="font-medium text-sm">{commit.authorName}</span>
										{commit.authorEmail && (
											<span className="text-xs text-gray-500 ml-2">{commit.authorEmail}</span>
										)}
									</div>
								</div>
								<div className="text-xs text-gray-500">
									{new Date(commit.commitDate).toLocaleDateString()} в {new Date(commit.commitDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
								</div>
							</div>
							
							<div className="p-4">
								<p className="mb-3 whitespace-pre-line">{commit.commitMessage}</p>
								<div className="bg-gray-50 p-2 rounded border font-mono text-xs text-gray-700 flex items-center overflow-x-auto">
									<svg className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									<span className="flex-shrink-0 mr-2">Комит:</span>
									<code className="font-mono text-xs">{commit.commitHash}</code>
								</div>
							</div>
							
							<div className="border-t px-4 py-2 bg-gray-50 flex justify-end">
								{selectedRepo.repositoryUrl && commit.commitHash && (
									<a 
										href={`${selectedRepo.repositoryUrl}/commit/${commit.commitHash}`} 
										target="_blank" 
										rel="noopener noreferrer"
										className="text-xs text-blue-600 hover:underline flex items-center"
									>
										<svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
											<path d="M15 3h6v6"></path>
											<path d="M10 14L21 3"></path>
										</svg>
										Просмотреть на GitHub
									</a>
								)}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
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