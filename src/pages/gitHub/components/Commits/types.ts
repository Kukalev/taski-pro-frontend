// src/pages/gitHub/components/Commits/types.ts
import {
	GitCommitResponseDto,
	GitRepositoryResponseDto
} from '../../../../services/github/types'

export interface CommitsListProps {
	commits: GitCommitResponseDto[];
	selectedRepo: GitRepositoryResponseDto | null; // Информация о выбранном репозитории
	loading: boolean;
	error: string | null;
	onBack: () => void; // Callback для возврата к списку репозиториев
}
