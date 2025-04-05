// Типы для запросов
export interface DeskCreateDto {
	deskName: string
	deskDescription: string
}

export interface DeskUpdateDto {
	deskName: string
	deskDescription?: string
	deskFinishDate?: Date | null
}

// Типы для ответов
export interface DeskResponseDto {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date
	userLimit: number
	username:string
}
