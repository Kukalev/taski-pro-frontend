import React, {useCallback, useEffect, useRef, useState} from 'react'
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
	const [isPartialSuccess, setIsPartialSuccess] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null); // <-- Добавляем ref для модального окна

	const resetForm = () => {
		setRepositoryUrl('');
		setBranchName('');
		setError(null);
		setIsLoading(false);
		setIsPartialSuccess(false);
	};

	// handleClose теперь вызывается только при клике на крестик или вне окна
	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose]);

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!deskId || !repositoryUrl || isLoading) return;

		setIsLoading(true);
		setError(null);
		setIsPartialSuccess(false);

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
			const errorMessage = GitHubService.handleError(err);
			setError(errorMessage);
			
			// Если ошибка касается только синхронизации, но репозиторий добавлен
			if (errorMessage.includes("Невозможно синхронизировать") || 
				errorMessage.includes("Сервис недоступен")) {
				setIsPartialSuccess(true);
			}
		} finally {
			setIsLoading(false);
		}
	}, [deskId, repositoryUrl, branchName, isLoading, onRepoAdded, handleClose]); // Добавил handleClose в зависимости

	// Обработчик клика вне модального окна
	const handleOutsideClick = useCallback((event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			handleClose();
		}
	}, [handleClose]);

	// Добавляем/удаляем слушатель клика вне окна
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick);
		} else {
			document.removeEventListener('mousedown', handleOutsideClick);
		}
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isOpen, handleOutsideClick]);

	// Не рендерим ничего, если модалка закрыта
	if (!isOpen || deskId === null) {
		return null;
	}

	// Стили для кнопки Добавить
	const submitButtonStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color)',
		color: 'white',
		cursor: 'pointer'
	};
	const submitButtonHoverStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color-dark)',
	};
	const submitButtonDisabledStyle: React.CSSProperties = {
		backgroundColor: '#e5e7eb', // Цвет для disabled (пример Tailwind bg-gray-200)
		color: '#9ca3af', // Цвет текста для disabled (пример Tailwind text-gray-400)
		cursor: 'default'
	};

	return (
		<div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] overflow-y-auto h-full w-full flex justify-center items-center z-50">
			<div ref={modalRef} className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
				<button
					onClick={handleClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer p-1"
					aria-label="Закрыть"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<h2 className="text-xl font-semibold mb-4">Добавить GitHub репозиторий</h2>

				{error && (
					<div className={`${isPartialSuccess ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-2 rounded mb-4 text-sm`} role="alert">
						{error}
						{isPartialSuccess && (
							<p className="mt-1 font-medium">
								Однако репозиторий, скорее всего, был добавлен. После закрытия этого окна обновите страницу, чтобы увидеть его в списке. Затем вы сможете повторить синхронизацию.
							</p>
						)}
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
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[var(--theme-color)] focus:border-[var(--theme-color)]"
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
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-color)] focus:border-[var(--theme-color)]"
							placeholder="main (по умолчанию)"
							disabled={isLoading}
						/>
						<p className="text-xs text-gray-500 mt-1">Если оставить пустым, будет использоваться ветка по умолчанию (main или master).</p>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={isLoading || !repositoryUrl}
							className="py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)] transition-all duration-200 ease-in-out"
							style={isLoading || !repositoryUrl ? submitButtonDisabledStyle : submitButtonStyle}
							onMouseOver={(e) => { if (!isLoading && repositoryUrl) Object.assign(e.currentTarget.style, submitButtonHoverStyle); }}
							onMouseOut={(e) => { if (!isLoading && repositoryUrl) Object.assign(e.currentTarget.style, submitButtonStyle); }}
						>
							{isLoading ? 'Добавление...' : 'Добавить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};