import { ReactNode } from 'react'

export interface HeaderButtonsProps {
	onProClick?: () => void
	onInviteClick?: () => void
}

export interface HeaderIconsProps {
	
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
