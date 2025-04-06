// src/pages/gitHub/components/Commits/Commits.tsx
import React from 'react'
import {CommitsListProps} from './types'

export const CommitsList: React.FC<CommitsListProps> = ({
	commits,
	selectedRepo,
	loading,
	error,
	onBack,
}) => {

	if (loading) {
		return <p>Загрузка коммитов...</p>;
	}

	if (error) {
		// Ошибку отображаем в родительском компоненте
		return null;
	}

	if (!selectedRepo) {
		return <p>Репозиторий не выбран.</p> // На всякий случай
	}


	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">
					Коммиты репозитория: <a href={selectedRepo.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedRepo.repositoryUrl}</a> ({selectedRepo.branchName})
				</h3>
				<button
					onClick={onBack}
					className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
				>
					Назад к репозиториям
				</button>
			</div>

			{commits.length > 0 ? (
				<ul>
					{commits.map((commit) => (
						<li key={commit.id} className="mb-2 p-3 border rounded bg-gray-50">
							<p className="font-mono text-sm text-gray-800 break-all">
								{commit.commitHash}
								{/* Можно добавить ссылку на коммит на GitHub, если возможно */}
							</p>
							<p className="mt-1">{commit.commitMessage}</p>
							<p className="text-xs text-gray-600 mt-1">
								Автор: {commit.authorName} ({commit.authorEmail}) | Дата: {new Date(commit.commitDate).toLocaleString()}
							</p>
						</li>
					))}
				</ul>
			) : (
				<p>Нет коммитов для отображения.</p>
			)}
		</div>
	);
};