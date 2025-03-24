export interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}

export interface SidebarSearchProps {
	placeholder?: string
}

export interface SidebarMenuProps {
	location: any
	onItemClick: (path: string) => void
}

export interface SidebarFooterProps {
	desksCount: number
}

export interface MenuItemProps {
	path: string
	icon: React.ReactNode
	label: string
	isActive: boolean
	onClick: () => void
}
