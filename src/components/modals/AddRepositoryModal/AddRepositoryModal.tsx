import React, {useCallback, useState} from 'react'
import {AddRepositoryModalProps} from './types'
import {GitHubService} from '../../../services/github/GitHub'
import {AddGitRepositoryDto} from '../../../services/github/types'

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
	isOpen,
	onClose,
	deskId,
	onRepoAdded,
}) => {
	const [repositoryUrl, setRepositoryUrl] = useState('');
	const [branchName, setBranchName] = useState(''); // По умолчанию пустая строка
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const resetForm = () => {
		setRepositoryUrl('');
		setBranchName('');
		setError(null);
		setIsLoading(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!deskId || !repositoryUrl || isLoading) return;

		setIsLoading(true);
		setError(null);

		const repoData: AddGitRepositoryDto = {
			repositoryUrl,
			branchName: branchName.trim() || undefined, // Отправляем undefined если пустая строка
		};

		try {
			console.log("[AddRepositoryModal] Отправка данных:", repoData, "для deskId:", deskId);
			const newRepo = await GitHubService.addRepositoryOnDesk(deskId, repoData);
			console.log("[AddRepositoryModal] Репозиторий успешно добавлен:", newRepo);
			onRepoAdded(newRepo); // Вызываем callback родителя
			handleClose(); // Закрываем модалку после успеха
		} catch (err) {
			console.error("[AddRepositoryModal] Ошибка добавления:", err);
			setError(GitHubService.handleError(err)); // Используем обработчик
		} finally {
			setIsLoading(false);
		}
	}, [deskId, repositoryUrl, branchName, isLoading, onRepoAdded, handleClose]); // Добавил handleClose в зависимости

	// Не рендерим ничего, если модалка закрыта
	if (!isOpen || deskId === null) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
			<div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
				<button
					onClick={handleClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
					aria-label="Закрыть"
				>
					<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<h2 className="text-xl font-semibold mb-4">Добавить GitHub репозиторий</h2>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm" role="alert">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-1">
							URL репозитория <span className="text-red-500">*</span>
						</label>
						<input
							type="url"
							id="repoUrl"
							value={repositoryUrl}
							onChange={(e) => setRepositoryUrl(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="https://github.com/user/repo.git"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
							Ветка (необязательно)
						</label>
						<input
							type="text"
							id="branchName"
							value={branchName}
							onChange={(e) => setBranchName(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="main (по умолчанию)"
							disabled={isLoading}
						/>
						<p className="text-xs text-gray-500 mt-1">Если оставить пустым, будет использоваться ветка по умолчанию (main или master).</p>
					</div>

					<div className="flex justify-end space-x-3">
						<button
							type="button"
							onClick={handleClose}
							disabled={isLoading}
							className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={isLoading || !repositoryUrl}
							className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{isLoading ? 'Добавление...' : 'Добавить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};