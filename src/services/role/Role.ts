import axios from 'axios'

interface UserRole {
	teamSize: string
	activity: string
	role: string
}

export const RoleService = {
	async addRole(data: UserRole): Promise<void> {
			const response = await axios.post('/api/user/add-role', data)
			return response.data
	}
}