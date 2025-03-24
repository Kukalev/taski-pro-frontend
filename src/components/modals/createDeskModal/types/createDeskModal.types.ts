export interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}

export interface CreateDeskModalProps {
	isOpen: boolean
	onClose: () => void
	onDeskCreated?: (newDesk: DeskData) => void
}

export interface ModalHeaderProps {
	title: string
	onClose: () => void
}

export interface ModalContentProps {
	deskName: string
	deskDescription: string
	setDeskName: (name: string) => void
	setDeskDescription: (desc: string) => void
	error: string | null
}

export interface ModalButtonsProps {
	onSubmit: () => void
	isValid: boolean
	isLoading: boolean
}
