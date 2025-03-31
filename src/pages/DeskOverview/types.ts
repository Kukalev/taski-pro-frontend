import { DeskData } from '../../components/sidebar/types/sidebar.types';

export interface DeskOverviewProps {
  desk: DeskData;
  refreshDesk: () => void;
}

export interface DeskHeaderProps {
  desk: DeskData;
  onEditName: () => void;
  onDateClick: () => void;
  deskName: string;
  setDeskName: (name: string) => void;
  isEditingName: boolean;
  onSaveName: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
  selectedDate: Date | null;
  formattedDate: string;
}

export interface DeskDescriptionProps {
  description: string;
  isEditingDescription: boolean;
  setDescription: (description: string) => void;
  setIsEditingDescription: (isEditing: boolean) => void;
  onSaveDescription: () => void;
  onDescriptionKeyDown: (e: React.KeyboardEvent) => void;
}

export interface DeskParticipantsProps {
  desk: DeskData;
}

export interface DeskDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onClose: () => void;
  isVisible: boolean;
}
