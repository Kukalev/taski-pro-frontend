export interface DeskDescriptionProps {
	desk: {
		id: number;
		deskName: string;
		description?: string;
		deskDescription?: string;
		deskFinishDate?: Date | null;
	};
	onDescriptionUpdate?: (newDescription: string) => void;
	isLoading?: boolean;
}



export interface ViewModeProps {
	currentDescription: string;
	handleEdit: () => void;
}

export interface EditModeProps {
	editedDescription: string;
	handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handleBlur: () => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	handleSave: () => void;
	isSaving: boolean;
	textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export interface SaveIndicatorProps {
	isSaving: boolean;
}