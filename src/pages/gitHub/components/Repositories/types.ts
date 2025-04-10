// src/pages/gitHub/components/Repositories/types.ts
import {GitRepositoryResponseDto} from '../../../../services/github/types'

export interface RepositoriesListProps {
  repositories: GitRepositoryResponseDto[];
  loading: boolean;
  error: string | null;
  onSelectRepo: (repoId: number) => void;
  onSyncRepo: (repoId: number) => Promise<void>;
  onDeleteRepo: (repoId: number) => void;
  onAddRepoClick: () => void;
  hasEditPermission: boolean;
}