import React from 'react'
import Modal from 'react-modal'
import {ThemedButton} from '../../ui/ThemedButton' // Убедитесь, что путь верный
import {IoClose} from 'react-icons/io5' // Импортируем иконку крестика

interface DeleteRepositoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	repositoryName: string;
	isLoading: boolean;
}

Modal.setAppElement('#root');

export const DeleteRepositoryModal: React.FC<DeleteRepositoryModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	repositoryName,
	isLoading,
}) => {
	const getShortRepoName = (url: string): string => {
		try {
			const path = new URL(url).pathname;
			return path.startsWith('/') ? path.substring(1) : path;
		} catch {
			return url;
		}
	};

	const shortName = getShortRepoName(repositoryName);

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			overlayClassName="fixed inset-0 bg-black/30 bg-opacity-60 z-50 flex justify-center items-center"
			// Добавим relative для позиционирования крестика
			className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md outline-none"
			contentLabel="Confirm Delete Repository"
			shouldCloseOnOverlayClick={!isLoading}
		>
			{/* Крестик для закрытия */}
			<button
				onClick={onClose}
				disabled={isLoading}
				className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-800 disabled:opacity-50 cursor-pointer transition-colors"
				aria-label="Закрыть"
			>
				<IoClose className="w-5 h-5" />
			</button>

			<div className="flex flex-col">
				<h2 className="text-xl font-semibold mb-2 text-gray-800">Подтвердите удаление</h2>
				<p className="mb-6 text-gray-600">
					Вы уверены, что хотите удалить репозиторий{' '}
					<strong className="font-medium text-gray-900 break-all">{shortName}</strong> из этой доски?
					<br />
					<span className="text-sm text-gray-500 mt-1 block">
            Это действие необратимо для связи с TaskiPro, но не удалит сам репозиторий на GitHub.
          </span>
				</p>
				<div className="flex justify-end space-x-3 mt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="px-4 py-2 rounded   bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
					>
						Отмена
					</button>
					<ThemedButton c
						onClick={onConfirm}
						isLoading={isLoading}

						className="px-4 py-2 rounded  text-white bg-[var(--theme-color)] hover:bg-[var(--theme-color-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
					>
						{isLoading ? 'Удаление...' : 'Удалить'}
					</ThemedButton>
				</div>
			</div>
		</Modal>
	);
};