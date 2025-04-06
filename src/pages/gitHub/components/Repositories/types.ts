// src/pages/gitHub/components/Repositories/types.ts
import {GitRepositoryResponseDto} from '../../../../services/github/types'

export interface RepositoriesListProps {
	repositories: GitRepositoryResponseDto[];
	loading: boolean;
	error: string | null;
	onSelectRepo: (repoId: number) => void; // Callback при выборе репозитория для просмотра коммитов
	onSyncRepo: (repoId: number) => Promise<void>; // Callback для синхронизации
	onDeleteRepo: (repoId: number) => Promise<void>; // Callback для удаления
	onAddRepoClick: () => void; // Callback для открытия модалки добавления
	hasEditPermission: boolean; // Права на редактирование/добавление/удаление
}