export interface LoginRequest {
	username: string
	password: string
}

export interface RegisterRequest {
	username: string
	email: string
	password: string
	firstName?: string
	lastName?: string
}

export interface AuthResponse {
	accessToken: string
	refreshToken?: string
	user?: {
		id: number
		username: string
		email: string
	}
}

export interface TokenStorage {
	accessToken: string
	refreshToken?: string
	username: string
}
