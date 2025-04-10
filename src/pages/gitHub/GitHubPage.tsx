import {useCallback, useEffect, useState} from 'react'
import {useOutletContext} from 'react-router-dom'
import {GitHubService} from '../../services/github/GitHub'
import {
  GitCommitResponseDto,
  GitRepositoryResponseDto
} from '../../services/github/types'
import {RepositoriesList} from './components/Repositories/Repositories'
import {CommitsList} from './components/Commits/Commits'
import {DeskDetailsContext} from './types'
import {
  AddRepositoryModal
} from '../../components/modals/AddRepositoryModal/AddRepositoryModal'
import {
  DeleteRepositoryModal
} from '../../components/modals/DeleteRepositoryModal/DeleteRrepositoryModal' // Импорт модалки удаления

export const GitHubPage = () => {
  const { desk, hasEditPermission } = useOutletContext<DeskDetailsContext>();
  const [repositories, setRepositories] = useState<GitRepositoryResponseDto[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitRepositoryResponseDto | null>(null);
  const [commits, setCommits] = useState<GitCommitResponseDto[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Состояния для модалки удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<GitRepositoryResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleError = (err: unknown) => {
    console.error("[GitHubPage] Error:", err);
    setError(GitHubService.handleError(err));
  };

  // --- Загрузка данных ---
  const loadRepositories = useCallback(async () => {
    if (!desk?.id) return;
    setLoadingRepos(true);
    setError(null);
    setRepositories([]); // Сброс перед загрузкой
    try {
      const data = await GitHubService.getRepositoriesByDeskId(desk.id);
      setRepositories(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingRepos(false);
    }
  }, [desk?.id]);

  const loadCommits = useCallback(async (repo: GitRepositoryResponseDto) => {
    if (!desk?.id) return;
    setSelectedRepo(repo); // Устанавливаем выбранный репозиторий
    setLoadingCommits(true);
    setError(null);
    setCommits([]); // Сброс перед загрузкой
    try {
      const data = await GitHubService.getCommitsByRepositoryId(desk.id, repo.id);
      setCommits(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingCommits(false);
    }
  }, [desk?.id]); // Зависимость от desk.id

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  // --- Обработчики Действий ---
  const handleSelectRepo = (repoId: number) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) {
      loadCommits(repo); // Загружаем коммиты для выбранного репозитория
    }
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setCommits([]);
    setError(null); // Сбрасываем ошибку при возврате
  };

  const handleSyncRepo = async (repoId: number) => {
    if (!desk?.id) return;
    setError(null);
    // Находим репозиторий ДО начала операции, чтобы обновить его потом
    const repoToUpdate = repositories.find(r => r.id === repoId);
    try {
      await GitHubService.syncRepository(desk.id, repoId);
      // Обновляем дату синхронизации в списке
      setRepositories(prev => prev.map(repo =>
        repo.id === repoId
          ? { ...repo, lastSyncDate: new Date().toISOString() }
          : repo
      ));
      // Если коммиты для этого репо были открыты, перезагружаем их с обновленными данными
      if (selectedRepo?.id === repoId && repoToUpdate) {
        const updatedRepoData = { ...repoToUpdate, lastSyncDate: new Date().toISOString() };
        loadCommits(updatedRepoData);
      }
    } catch (err) {
      handleError(err);
      // Важно перебросить ошибку, чтобы RepositoriesList сбросил свое состояние загрузки
      throw err;
    }
  };

  // Функция для ОТКРЫТИЯ модалки удаления
  const openDeleteConfirmation = (repoId: number) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) {
      setRepoToDelete(repo);
      setIsDeleteModalOpen(true);
    }
  };

  // Функция для ПОДТВЕРЖДЕНИЯ удаления (вызывается из модалки)
  const confirmDeleteRepo = async () => {
    if (!desk?.id || !repoToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await GitHubService.removeRepositoryFromDesk(desk.id, repoToDelete.id);
      // Оптимистичное обновление UI
      setRepositories((prev) => prev.filter((repo) => repo.id !== repoToDelete.id));
      setIsDeleteModalOpen(false); // Закрываем модалку
      setRepoToDelete(null); // Сбрасываем выбранное репо
    } catch (err) {
      handleError(err); // Отображаем ошибку на странице
      // Оставляем модалку открытой при ошибке
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddRepoClick = () => {
    setIsAddModalOpen(true);
  };

  const handleRepoAdded = (newRepo: GitRepositoryResponseDto) => {
    // Добавляем новый репозиторий к списку
    setRepositories((prev) => [...prev, newRepo]);
    setIsAddModalOpen(false); // Закрываем модалку добавления
  };

  return (
    <div className="p-6">
      {/* Блок отображения ошибки */}
      {error && !loadingRepos && !loadingCommits && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)} // Позволяем закрыть ошибку
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Закрыть</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {/* Условный рендеринг: Список репозиториев ИЛИ Список коммитов */}
      {!selectedRepo ? (
        <RepositoriesList
          repositories={repositories}
          loading={loadingRepos}
          error={error} // Передаем ошибку, но RepositoriesList ее не отображает
          onSelectRepo={handleSelectRepo}
          onSyncRepo={handleSyncRepo}
          onDeleteRepo={openDeleteConfirmation} // Передаем функцию открытия модалки
          onAddRepoClick={handleAddRepoClick}
          hasEditPermission={hasEditPermission}
        />
      ) : (
        <CommitsList
          commits={commits}
          selectedRepo={selectedRepo}
          loading={loadingCommits}
          error={error} // Передаем ошибку, но CommitsList ее не отображает
          onBack={handleBackToRepos}
        />
      )}

      {/* Модальное окно добавления репозитория */}
      {desk && (
        <AddRepositoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          deskId={desk.id}
          onRepoAdded={handleRepoAdded}
        />
      )}

      {/* Модальное окно удаления репозитория */}
      {repoToDelete && (
        <DeleteRepositoryModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)} // Закрытие
          onConfirm={confirmDeleteRepo}             // Подтверждение
          repositoryName={repoToDelete.repositoryUrl} // Имя для отображения
          isLoading={isDeleting}                      // Статус загрузки
        />
      )}
    </div>
  );
};