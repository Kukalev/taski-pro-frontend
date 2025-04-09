import api from '../../api'

const BASE_URL = '/v1/desk'

export const deleteDesk = async (id: number): Promise<string> => {
	const response = await api.delete(`${BASE_URL}/${id}`)
	return response.data
}
