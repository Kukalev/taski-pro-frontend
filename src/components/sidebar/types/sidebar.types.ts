export interface DeskData {
	id: number
	deskName: string
	deskDescription?: string
	deskCreateDate: Date | string
	deskFinishDate: Date | string | null
	userLimit?: number
	status?: string
	username?: string
}

// Убедитесь, что в sidebar.types.ts.ts.ts есть этот интерфейс:
export interface SidebarDesksProps {
	desks: DeskData[]
	loading: boolean
	onDeskClick: (id: number) => void
	onAddClick: () => void
	onRename: (id: number) => void
	onDelete: (id: number) => void
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
