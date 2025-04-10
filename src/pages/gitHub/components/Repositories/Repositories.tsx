// src/pages/gitHub/components/Repositories/Repositories.tsx
import React, {useState} from 'react'
import {RepositoriesListProps} from './types'
import {ThemedButton} from '../../../../components/ui/ThemedButton'
import {SlReload} from 'react-icons/sl'
import {IoClose} from 'react-icons/io5'

export const RepositoriesList: React.FC<RepositoriesListProps> = ({
  repositories,
  loading,
  error,
  onSelectRepo,
  onSyncRepo,
  onDeleteRepo,
  onAddRepoClick,
  hasEditPermission,
}) => {
  const [syncingRepoId, setSyncingRepoId] = useState<number | null>(null);


  const handleSync = async (repoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход к коммитам
    setSyncingRepoId(repoId);
    try {
      await onSyncRepo(repoId);
      // Можно добавить уведомление об успехе
    } catch (err) {
      // Ошибку обработает родительский компонент
      console.error("Sync error in component", err);
    } finally {
      setSyncingRepoId(null);
    }
  };

  // УПРОЩАЕМ handleDelete
  const handleDelete = (repoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход к коммитам
    // Больше не нужно подтверждение здесь
    // Просто вызываем колбэк, который откроет модалку в GitHubPage
    onDeleteRepo(repoId);
    // Логика с setDeletingRepoId и try/catch удалена
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse flex flex-col items-center">
          {/* ... SVG и текст загрузки ... */}
          <svg
            className="h-8 w-8 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <p className="mt-3 text-gray-500">Загрузка репозиториев...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Ошибку отображаем в родительском компоненте
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Привязанные репозитории</h3>
        {/* Кнопка "Добавить" в заголовке остается, если есть репозитории И права */}
        {hasEditPermission && repositories.length > 0 && (
          <ThemedButton
            onClick={onAddRepoClick}
            className="py-1 px-3 rounded text-sm"
          >
            Добавить репозиторий
          </ThemedButton>
        )}
        {/* Если репозиториев нет, кнопка будет ниже, по центру */}
      </div>

      {repositories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="border rounded shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer bg-white hover:border-blue-400"
              onClick={() => onSelectRepo(repo.id)}
            >
              {/* ... Содержимое карточки репозитория ... */}
              <div className="p-3">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-4 w-4 text-gray-600 mr-2 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  <h4
                    className="text-sm font-medium truncate"
                    title={repo.repositoryUrl}
                  >
                    {new URL(repo.repositoryUrl).pathname.substring(1)}
                  </h4>
                </div>
                <div className="flex flex-col space-y-1 text-xs text-gray-500">
                  <div className="bg-gray-100 px-2 py-1 rounded text-center">
                    {repo.branchName}
                  </div>

                  {repo.lastSyncDate && (
                    <div className="text-xs text-gray-500 truncate">
                      Синх: {new Date(repo.lastSyncDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              {hasEditPermission && (
                <div className="flex justify-end border-t bg-gray-50 px-2 py-1">
                  {/* ... Кнопка синхронизации ... */}
                  <button
                    onClick={(e) => handleSync(repo.id, e)}
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full mr-1 transition-colors cursor-pointer"
                    disabled={syncingRepoId === repo.id}
                    title="Синхронизировать"
                  >
                    <SlReload
                      className={`w-4 h-4 ${
                        syncingRepoId === repo.id
                          ? "animate-spin text-blue-600"
                          : ""
                      }`}
                    />
                  </button>
                  {/* ОБНОВЛЕННАЯ КНОПКА УДАЛЕНИЯ */}
                  <button
                    onClick={(e) => handleDelete(repo.id, e)}
                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    // УДАЛЯЕМ disabled={deletingRepoId === repo.id}
                    title="Удалить"
                  >
                    <IoClose
                      className={`w-4 h-4 ${'' // УДАЛЯЕМ условие для text-red-600
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          {/* ... Состояние, когда нет репозиториев ... */}
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <p className="text-gray-500">Нет привязанных репозиториев.</p>
          {hasEditPermission && (
            <ThemedButton
              onClick={onAddRepoClick}
              className="mt-3 py-1 px-3 rounded text-sm"
            >
              Добавить репозиторий
            </ThemedButton>
          )}
        </div>
      )}
    </div>
  );
};