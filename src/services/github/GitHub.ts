// src/services/github/GitHub.ts
import {handleGitHubError} from './utils/errorHandlers' // Новое имя обработчика
import {addRepositoryOnDesk} from './api/addRepositoryOnDesk'
import {removeRepositoryFromDesk} from './api/removeRepositoryFromDesk'
import {getRepositoriesByDeskId} from './api/getRepositoriesByDeskId' // Исправлено имя файла
import {getCommitsByRepositoryId} from './api/getCommitsByRepositoryId'
import {syncRepository} from './api/syncRepository'

// Экспортируем сервис для GitHub
export const GitHubService = {
	handleError: handleGitHubError,
	addRepositoryOnDesk,
	removeRepositoryFromDesk,
	getRepositoriesByDeskId,
	getCommitsByRepositoryId,
	syncRepository
};