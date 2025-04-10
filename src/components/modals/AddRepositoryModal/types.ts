import {GitRepositoryResponseDto} from '../../../services/github/types'

export interface AddRepositoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number | null;
	onRepoAdded: (newRepo: GitRepositoryResponseDto) => void;
}