import { useCallback, useEffect, useState } from "react"; // Добавил React
import { useOutletContext } from "react-router-dom";
import { GitHubService } from "../../services/github/GitHub";
import {
  GitCommitResponseDto,
  GitRepositoryResponseDto,
} from "../../services/github/types";
import { RepositoriesList } from "./components/Repositories/Repositories";
// 5. Корректный путь
import { CommitsList } from "./components/Commits/Commits";
import { DeskDetailsContext } from "./types"; // <--- Новый импорт
// Импортируем модальное окно
import { AddRepositoryModal } from "../../components/modals/AddRepositoryModal/AddRepositoryModal";

export const GitHubPage = () => {
  const { desk, hasEditPermission } = useOutletContext<DeskDetailsContext>();
  const [repositories, setRepositories] = useState<GitRepositoryResponseDto[]>(
    []
  );
  const [selectedRepo, setSelectedRepo] =
    useState<GitRepositoryResponseDto | null>(null);
  const [commits, setCommits] = useState<GitCommitResponseDto[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleError = (err: unknown) => {
    console.error("[GitHubPage] Error:", err); // Добавим лог
    setError(GitHubService.handleError(err));
  };

  // --- Загрузка данных ---

  const loadRepositories = useCallback(async () => {
    if (!desk?.id) return;
    setLoadingRepos(true);
    setError(null);
    setRepositories([]);
    try {
      const data = await GitHubService.getRepositoriesByDeskId(desk.id);
      setRepositories(data);
    } catch (err) {
      handleError(err); // Используем общую функцию
    } finally {
      setLoadingRepos(false);
    }
  }, [desk?.id]);

  const loadCommits = useCallback(
    async (repo: GitRepositoryResponseDto) => {
      if (!desk?.id) return;
      setSelectedRepo(repo);
      setLoadingCommits(true);
      setError(null);
      setCommits([]);
      try {
        const data = await GitHubService.getCommitsByRepositoryId(
          desk.id,
          repo.id
        );
        setCommits(data);
      } catch (err) {
        handleError(err); // Используем общую функцию
      } finally {
        setLoadingCommits(false);
      }
    },
    [desk?.id]
  );

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  // --- Обработчики Действий ---

  const handleSelectRepo = (repoId: number) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) {
      loadCommits(repo);
    }
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setCommits([]);
    setError(null);
  };

  const handleSyncRepo = async (repoId: number) => {
    if (!desk?.id) return;
    setError(null);
    try {
      await GitHubService.syncRepository(desk.id, repoId);
      // Опционально: обновить дату синхронизации в состоянии
      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === repoId
            ? { ...repo, lastSyncDate: new Date().toISOString() }
            : repo
        )
      );
    } catch (err) {
      handleError(err); // Отображаем ошибку на странице
      throw err; // Перебрасываем, чтобы RepositoriesList сбросил loading
    }
  };

  const handleDeleteRepo = async (repoId: number) => {
    if (!desk?.id) return;
    setError(null);
    try {
      await GitHubService.removeRepositoryFromDesk(desk.id, repoId);
      setRepositories((prev) => prev.filter((repo) => repo.id !== repoId));
      alert("Репозиторий успешно удален!");
    } catch (err) {
      handleError(err); // Отображаем ошибку на странице
      throw err; // Перебрасываем, чтобы RepositoriesList сбросил loading
    }
  };

  const handleAddRepoClick = () => {
    setIsAddModalOpen(true);
  };

  const handleRepoAdded = (newRepo: GitRepositoryResponseDto) => {
    setRepositories((prev) => [...prev, newRepo]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6">
      {error && !loadingRepos && !loadingCommits && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {!selectedRepo ? (
        <RepositoriesList
          repositories={repositories}
          loading={loadingRepos}
          error={error} // Передаем ошибку для информации, но не отображаем в дочернем
          onSelectRepo={handleSelectRepo}
          onSyncRepo={handleSyncRepo}
          onDeleteRepo={handleDeleteRepo}
          onAddRepoClick={handleAddRepoClick}
          hasEditPermission={hasEditPermission}
        />
      ) : (
        <CommitsList
          commits={commits}
          selectedRepo={selectedRepo}
          loading={loadingCommits}
          error={error} // Передаем ошибку для информации, но не отображаем в дочернем
          onBack={handleBackToRepos}
        />
      )}

      {/* Используем модальное окно */}
      {desk && (
        <AddRepositoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          deskId={desk.id}
          onRepoAdded={handleRepoAdded} // Передаем callback
        />
      )}
    </div>
  );
};
