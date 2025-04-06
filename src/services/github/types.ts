// Тип для запроса на добавление репозитория
export interface AddGitRepositoryDto {
    repositoryUrl: string;
    branchName?: string;
}

// Тип для ответа от сервера с информацией о репозитории
export interface GitRepositoryResponseDto {
    id: number;
    repositoryUrl: string;
    branchName: string;
    lastSyncDate?: string;
}

// Тип для ответа от сервера с информацией о коммите
export interface GitCommitResponseDto {
    id: number;
    commitHash: string;
    authorName: string;
    authorEmail: string;
    commitDate: string;
    commitMessage: string;
}

