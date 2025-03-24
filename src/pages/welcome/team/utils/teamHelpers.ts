import { TeamData } from '../types/team.types'

/**
 * Проверяет, может ли пользователь продолжить (кнопка активна)
 */
export const isStepComplete = (step: number, teamData: TeamData): boolean => {
	switch (step) {
		case 1:
			return !!teamData.teamSize
		case 2:
			return teamData.activity !== 'Не выбрано'
		case 3:
			return teamData.role !== 'Не выбрано'
		default:
			return false
	}
}

/**
 * Сохраняет данные команды
 */
export const saveTeamData = async (teamData: TeamData): Promise<void> => {
	console.log('Отправляемые данные для роли:', teamData)
	// В будущем здесь будет запрос к API
	// return RoleService.addRole(teamData);
}
