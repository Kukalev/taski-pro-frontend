import {DeskData} from '../../../../components/sidebar/types/sidebar.types'
import React from 'react'

export interface DeskHeaderProps {
	desk: {
		id: number;
		deskName: string;
		description?: string;
		deskDescription?: string;
		deskCreateDate?: string | Date;
		deskFinishDate?: string | Date | null;
		status?: DeskStatus;
		username?: string;
	};
	onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
	isLoading?: boolean;
	error?: string | null;
	onDateClick?: (date?: Date | null) => void;
	selectedDate?: Date | null;
	hasEditPermission?: boolean;
	onNameSave?: (name: string) => Promise<void> | void;
	onDateOrStatusSave: (updateData: Date | null /* | { status: DeskStatus } */) => Promise<void> | void;
}

// Enum для статусов
export enum DeskStatus {
	INACTIVE = 'Не активный',
	IN_PROGRESS = 'В работе',
	AT_RISK = 'Под угрозой',
	PAUSED = 'Приостановлен'
}

export interface DeskLogoProps {
	deskName?: string;
}

export interface DeskTitleEditorProps {
	deskName?: string;
	isEditing: boolean;
	isLoading: boolean;
	editedName: string;
	setEditedName: (name: string) => void;
	handleEdit: () => void;
	handleBlur: () => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
	hasEditPermission?: boolean;
}

export interface DateRangeSelectorProps {
	deskId?: number;
	deskName?: string;
	deskDescription?: string;
	deskCreateDate?: string | Date;
	deskFinishDate?: string | Date | null | any; // Допускаем any временно из-за возможной ошибки в state
	isCalendarOpen: boolean;
	setIsCalendarOpen: (isOpen: boolean) => void;
	onDateSave: (date: Date | null) => Promise<void> | void;
	calendarButtonRef: React.RefObject<HTMLButtonElement | null>;
	hasEditPermission?: boolean;
}

export interface StatusSelectorProps {
	currentStatus: DeskStatus;
	statusMenuOpen: boolean;
	toggleStatusMenu: () => void;
	statusButtonRef: React.RefObject<HTMLDivElement | null>;
	hasEditPermission?: boolean;
}

export interface StatusMenuProps {
	isOpen: boolean;
	handleStatusChange: (status: DeskStatus) => void;
	statusMenuRef: React.RefObject<HTMLDivElement | null>;
}