import {GitRepositoryResponseDto} from '../../../services/github/types'

export interface AddRepositoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number | null; // ID доски, к которой добавляем
	onRepoAdded: (newRepo: GitRepositoryResponseDto) => void; // Callback после успешного добавления
}