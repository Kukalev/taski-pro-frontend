export interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number;
	onUserAdded?: () => void;
}

export interface UserResponseDto {
	username: string;
	userName?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}

export interface SearchBarProps {
	searchQuery: string;
	setSearchQuery: (term: string) => void;
	isLoading: boolean;
	inputRef: React.RefObject<HTMLInputElement> ;
}

export interface UsersListProps {
	filteredUsers: UserResponseDto[];
	handleSelectUser: (user: UserResponseDto) => void;
	getUserInitials: (user: UserResponseDto) => string;
}

export interface SelectedUserPreviewProps {
	selectedUser: UserResponseDto;
	handleCancelUserSelection: () => void;
	accessType: string;
	setAccessType: (value: string) => void;
	getUserInitials: (user: UserResponseDto) => string;
}

export interface ModalFooterProps {
	onClose: () => void;
	handleAddUser: () => void;
	isLoading: boolean;
	selectedUser: UserResponseDto | null;
	error: string;
}