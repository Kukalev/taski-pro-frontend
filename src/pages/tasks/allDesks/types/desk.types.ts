export interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}
