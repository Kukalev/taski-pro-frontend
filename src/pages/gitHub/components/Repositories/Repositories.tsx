// src/pages/gitHub/components/Repositories/Repositories.tsx
import React, {useState} from 'react'
import {RepositoriesListProps} from './types'
import { ThemedButton } from '../../../../components/ui/ThemedButton'

export const RepositoriesList: React.FC<RepositoriesListProps> = ({
	repositories,
	loading,
	error,
	onSelectRepo,
	onSyncRepo,
	onDeleteRepo,
	onAddRepoClick,
	hasEditPermission
}) => {
	const [syncingRepoId, setSyncingRepoId] = useState<number | null>(null);
	const [deletingRepoId, setDeletingRepoId] = useState<number | null>(null);

	const handleSync = async (repoId: number) => {
		setSyncingRepoId(repoId);
		try {
			await onSyncRepo(repoId);
			// Можно добавить уведомление об успехе
		} catch (err) {
			// Ошибку обработает родительский компонент
			console.error("Sync error in component", err)
		} finally {
			setSyncingRepoId(null);
		}
	};

	const handleDelete = async (repoId: number) => {
		// Добавить подтверждение перед удалением!
		if (!window.confirm(`Вы уверены, что хотите удалить репозиторий ID: ${repoId}?`)) {
			return;
		}
		setDeletingRepoId(repoId);
		try {
			await onDeleteRepo(repoId);
			// Можно добавить уведомление об успехе
		} catch (err) {
			console.error("Delete error in component", err)
		} finally {
			setDeletingRepoId(null);
		}
	};


	if (loading) {
		return <p>Загрузка репозиториев...</p>;
	}

	if (error) {
		// Ошибку отображаем в родительском компоненте
		return null;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">Привязанные репозитории</h3>
				{hasEditPermission && (
					<ThemedButton
						onClick={onAddRepoClick}
						className="py-1 px-3 rounded text-sm"
					>
						Добавить репозиторий
					</ThemedButton>
				)}
			</div>

			{repositories.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{repositories.map((repo) => (
						<div key={repo.id} className="border rounded shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer bg-white">
							<div className="p-3 border-b">
								<div className="flex items-center mb-2">
									<svg className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
									</svg>
									<h4 
										className="text-sm font-medium truncate flex-1" 
										title={repo.repositoryUrl}
										onClick={() => onSelectRepo(repo.id)}
									>
										{new URL(repo.repositoryUrl).pathname.substring(1)}
									</h4>
								</div>
								<div className="flex justify-between text-xs text-gray-500">
									<span className="bg-gray-100 px-2 py-1 rounded">{repo.branchName}</span>
									{repo.lastSyncDate && <span>Синх: {new Date(repo.lastSyncDate).toLocaleDateString()}</span>}
								</div>
							</div>
							
							{hasEditPermission && (
								<div className="flex border-t bg-gray-50">
									<button
										onClick={() => onSelectRepo(repo.id)}
										className="flex-1 p-2 text-xs text-blue-600 hover:bg-blue-50 border-r"
									>
										Коммиты
									</button>
									<button
										onClick={() => handleSync(repo.id)}
										className="flex-1 p-2 text-xs text-yellow-600 hover:bg-yellow-50 border-r disabled:opacity-50"
										disabled={syncingRepoId === repo.id}
									>
										{syncingRepoId === repo.id ? 'Синхр...' : 'Синхр.'}
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(repo.id);
										}}
										className="flex-1 p-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
										disabled={deletingRepoId === repo.id}
									>
										{deletingRepoId === repo.id ? 'Удаление...' : 'Удалить'}
									</button>
								</div>
							)}
							
							{!hasEditPermission && (
								<div className="p-2 border-t bg-gray-50">
									<button
										onClick={() => onSelectRepo(repo.id)}
										className="w-full p-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
									>
										Посмотреть коммиты
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-8 bg-gray-50 rounded-lg">
					<svg className="h-12 w-12 text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
					</svg>
					<p className="text-gray-500">Нет привязанных репозиториев.</p>
					{hasEditPermission && (
						<ThemedButton
							onClick={onAddRepoClick}
							className="mt-3 py-1 px-3 rounded text-sm"
						>
							Добавить репозиторий
						</ThemedButton>
					)}
				</div>
			)}
		</div>
	);
};