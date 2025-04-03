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
	};
	onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
	isLoading?: boolean;
	error?: string | null;
	updateDeskName: (name: string) => Promise<void>;
	onDateClick?: (date?: Date | null) => void;
	selectedDate?: Date | null;
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
	inputRef: React.RefObject<HTMLInputElement>;
}

export interface DateRangeSelectorProps {
	deskId?: number;
	deskName?: string;
	deskDescription?: string;
	deskCreateDate?: string | Date;
	deskFinishDate?: string | Date | null;
	selectedDate?: Date | null;
	isCalendarOpen: boolean;
	setIsCalendarOpen: (isOpen: boolean) => void;
	onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
	calendarButtonRef: React.RefObject<HTMLButtonElement>;
}

export interface StatusSelectorProps {
	currentStatus: DeskStatus;
	statusMenuOpen: boolean;
	toggleStatusMenu: () => void;
	statusButtonRef: React.RefObject<HTMLDivElement>;
}

export interface StatusMenuProps {
	isOpen: boolean;
	handleStatusChange: (status: DeskStatus) => void;
	statusMenuRef: React.RefObject<HTMLDivElement>;
}