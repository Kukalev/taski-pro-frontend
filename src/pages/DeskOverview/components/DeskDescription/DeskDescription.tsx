import React, {useCallback, useEffect, useRef, useState} from 'react'
import {DeskDescriptionProps} from './types'
import ViewMode from './components/ViewMode'
import EditMode from './components/EditMode'

const DeskDescription: React.FC<DeskDescriptionProps> = ({
	desk,
	onDescriptionSave,
	isLoading = false,
	hasEditPermission = true,
}) => {
	// Используем либо deskDescription, либо description, что найдется
	const currentDescription = desk.deskDescription || desk.description || '';

	const [isEditing, setIsEditing] = useState(false);
	// Два состояния: одно для UI, другое для сервера
	const [displayDescription, setDisplayDescription] = useState(currentDescription);
	const [editedDescription, setEditedDescription] = useState(currentDescription);
	const [isSaving, setIsSaving] = useState(false);
	const [containerHeight, setContainerHeight] = useState<number | null>(null);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Запоминаем исходную высоту контейнера при первом рендере
	useEffect(() => {
		if (containerRef.current && !containerHeight) {
			setContainerHeight(containerRef.current.offsetHeight);
		}
	}, [containerHeight]);

	// Обновляем состояние при изменении пропсов
	useEffect(() => {
		setDisplayDescription(currentDescription);
		setEditedDescription(currentDescription);
	}, [currentDescription]);

	// Фокус на текстовом поле при входе в режим редактирования
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	}, [isEditing]);

	// Debounced сохранение при вводе
	const debouncedSave = useCallback((text: string) => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}
		
		saveTimeoutRef.current = setTimeout(() => {
			handleServerSave(text);
		}, 1000);
	}, [onDescriptionSave]);

	const handleEdit = () => {
		if (isLoading || isSaving || !hasEditPermission) return;
		setIsEditing(true);
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		
		// Немедленно обновляем UI
		setDisplayDescription(newText);
		setEditedDescription(newText);
		
		// Запускаем отложенное сохранение на сервер
		debouncedSave(newText);
	};

	// Функция сохранения на сервере
	const handleServerSave = async (text: string) => {
		if (text === currentDescription) return;
		
		setIsSaving(true);
		try {
			console.log('Сохраняем описание (через onDescriptionSave):', text);
			if (onDescriptionSave) {
				await onDescriptionSave(text);
				console.log('Описание успешно обновлено (через onDescriptionSave)');
			} else {
				console.warn("DeskDescription: onDescriptionSave prop is missing!");
			}
		} catch (error) {
			console.error('Ошибка при обновлении описания (через onDescriptionSave):', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleBlur = () => {
		setIsEditing(false);
		// При выходе из режима редактирования сразу сохраняем изменения
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
			handleServerSave(editedDescription);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsEditing(false);
			// Можно сбросить изменения при Escape
			setDisplayDescription(currentDescription);
			setEditedDescription(currentDescription);
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		} else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			handleBlur(); // Сохраняем по Ctrl+Enter
		}
	};

	return (
		<div className="max-w-4xl mx-auto mb-6">
			<h2 className="text-lg font-medium mb-2">Описание</h2>

			{/* Контейнер с фиксированной высотой */}
			<div
				ref={containerRef}
				style={{
					minHeight: containerHeight ? `${containerHeight}px` : '100px',
					height: 'auto'
				}}
			>
				{isEditing ? (
					<EditMode
						editedDescription={displayDescription}
						handleChange={handleChange}
						handleBlur={handleBlur}
						handleKeyDown={handleKeyDown}
						isSaving={isSaving}
						textareaRef={textareaRef}
					/>
				) : (
					<ViewMode
						currentDescription={displayDescription}
						handleEdit={handleEdit}
					/>
				)}
			</div>
		</div>
	);
};

export default DeskDescription;