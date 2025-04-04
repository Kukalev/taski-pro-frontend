import { ReactNode } from 'react'

export interface HeaderButtonsProps {
	onProClick?: () => void
	onInviteClick?: () => void
}

export interface HeaderIconsProps {
	// Можно добавить props для управления иконками
}

export interface UserAvatarProps {
	username: string
	email?: string
	onLogout: () => void
	onSettingsClick?: () => void
}

export interface IconButtonProps {
	icon: ReactNode
	onClick?: () => void
}
