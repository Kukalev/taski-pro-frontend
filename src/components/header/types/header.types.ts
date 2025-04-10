import {ReactNode} from 'react'

export interface HeaderButtonsProps {
	onProClick?: () => void
}



export interface HeaderLogoProps {
	onToggleSidebar?: () => void
}

export interface UserAvatarProps {
	username: string
	email?: string
	avatarUrl?: string | null
	onLogout?: () => void
	onSettingsClick?: () => void
	size?: 'xs' | 'sm' | 'md' | 'lg'
}

export interface IconButtonProps {
	icon: ReactNode
	onClick?: () => void
	className?: string
}
