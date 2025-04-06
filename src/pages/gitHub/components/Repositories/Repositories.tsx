// src/pages/gitHub/components/Repositories/Repositories.tsx
import React, {useState} from 'react'
import {RepositoriesListProps} from './types'

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
					<button
						onClick={onAddRepoClick}
						className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
					>
						Добавить репозиторий
					</button>
				)}
			</div>

			{repositories.length > 0 ? (
				<ul>
					{repositories.map((repo) => (
						<li key={repo.id} className="mb-2 p-3 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center">
							<div className="mb-2 sm:mb-0">
								<a
									href={repo.repositoryUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline break-all"
								>
									{repo.repositoryUrl}
								</a>
								<span className="text-sm text-gray-600 ml-2">({repo.branchName})</span>
								{repo.lastSyncDate && (
									<p className="text-xs text-gray-500 mt-1">
										Последняя синхронизация: {new Date(repo.lastSyncDate).toLocaleString()}
									</p>
								)}
							</div>
							<div className="flex flex-shrink-0 space-x-2 mt-2 sm:mt-0">
								<button
									onClick={() => onSelectRepo(repo.id)}
									className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
								>
									Коммиты
								</button>
								{hasEditPermission && (
									<>
										<button
											onClick={() => handleSync(repo.id)}
											className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded disabled:opacity-50"
											disabled={syncingRepoId === repo.id}
										>
											{syncingRepoId === repo.id ? 'Синхр...' : 'Синхронизировать'}
										</button>
										<button
											onClick={() => handleDelete(repo.id)}
											className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded disabled:opacity-50"
											disabled={deletingRepoId === repo.id}
										>
											{deletingRepoId === repo.id ? 'Удаление...' : 'Удалить'}
										</button>
									</>
								)}
							</div>
						</li>
					))}
				</ul>
			) : (
				<p>Нет привязанных репозиториев.</p>
			)}
		</div>
	);
};