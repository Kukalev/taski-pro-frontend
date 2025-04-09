import React, { useEffect, useRef, useState } from "react";
import { DeskHeaderProps, DeskStatus } from "./types";
import DeskLogo from "./components/DeskLogo";
import DeskTitleEditor from "./components/DeskTitleEditor";
import DateRangeSelector from "./components/DeskRangeSelector";
import StatusSelector from "./components/StatusSelector";
import StatusMenu from "./components/StatusMenu";
import { DeskService } from "../../../../services/desk/Desk";
import { DESK_UPDATE_EVENT } from "../../hooks/useDeskActions";
import { useDesks, DeskData } from "../../../../contexts/DeskContext";

const DeskHeader: React.FC<DeskHeaderProps> = ({
  desk,
  onDeskUpdate,
  isLoading = false,
  selectedDate,
  hasEditPermission = true, // По умолчанию права есть
  onNameSave, // Получаем новый проп
  onDateOrStatusSave, // Принимает Date | null
}) => {
  // Получаем функцию updateDesk из контекста
  const { updateDesk: updateDeskInContext } = useDesks();

  // Локальное состояние
  const [isEditing, setIsEditing] = useState(false);
  const [localDeskName, setLocalDeskName] = useState(desk.deskName || "");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<DeskStatus>(
    desk.status ? desk.status : DeskStatus.IN_PROGRESS
  );

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const statusButtonRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  // Синхронизируем локальное имя с props только при смене доски
  useEffect(() => {
    if (!isEditing) {
      setLocalDeskName(desk.deskName || "");
    }
  }, [desk.deskName, isEditing]);

  useEffect(() => {
    if (desk.status) {
      setCurrentStatus(desk.status);
    }
  }, [desk.status]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Закрытие меню статусов при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node) &&
        statusButtonRef.current &&
        !statusButtonRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    // Проверяем права доступа
    if (!hasEditPermission) return;

    setIsEditing(true);
  };

  const handleNameChange = (name: string) => {
    setLocalDeskName(name);
  };

  const handleBlur = () => {
    if (isEditing) {
      if (localDeskName.trim() === "") {
        // Если поле пустое, возвращаем исходное имя (только локально)
        setLocalDeskName(desk.deskName || "");
      } else if (localDeskName !== desk.deskName) {
        // Если имя изменилось и есть обработчик, вызываем его
        if (onNameSave) {
          onNameSave(localDeskName); // Вызываем проп, переданный из DeskOverviewPage
        } else {
          console.warn("DeskHeader: onNameSave prop is missing!");
        }
      }
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur(); // Вызываем нашу логику блюра (которая вызовет onNameSave)
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setLocalDeskName(desk.deskName || ""); // Отмена - возвращаем старое имя локально
    }
  };

  const toggleStatusMenu = () => {
    // Проверяем права доступа
    if (!hasEditPermission) return;

    setStatusMenuOpen(!statusMenuOpen);
    if (!statusMenuOpen) {
      setIsCalendarOpen(false);
    }
  };

  const handleStatusChange = (status: DeskStatus) => {
    if (!hasEditPermission) return;
    setCurrentStatus(status);
    setStatusMenuOpen(false);
    if (typeof onDateOrStatusSave === "function") {
      console.warn(
        "Обновление статуса требует доработки с API через onDateOrStatusSave"
      );
      // Пример: await onDateOrStatusSave({ status: status });
    }
  };

  const handleDateUpdate = (update: { deskFinishDate: Date | null }) => {
    if (!hasEditPermission) return;
    if (typeof onDeskUpdate === "function") {
      onDeskUpdate(update);
    } else {
      console.warn("DeskHeader: onDeskUpdate prop is missing for date change!");
    }
  };

  return (
    <div className="bg-white py-8">
      <div className="max-w-4xl mx-auto flex items-center px-4">
        <div className="flex flex-col items-start mr-8">
          {/* Логотип - используем локальное имя */}
          <DeskLogo deskName={localDeskName} />

          {/* Редактор имени */}
          <DeskTitleEditor
            deskName={localDeskName}
            isEditing={isEditing}
            isLoading={isLoading}
            editedName={localDeskName}
            setEditedName={handleNameChange}
            handleEdit={handleEdit}
            handleBlur={handleBlur}
            handleKeyDown={handleKeyDown}
            inputRef={inputRef}
            hasEditPermission={hasEditPermission}
          />
        </div>

        {/* Дата и статус */}
        <div className="flex items-center space-x-5 ml-auto">
          <DateRangeSelector
            deskId={desk.id}
            deskName={localDeskName}
            deskDescription={desk.deskDescription || ""}
            deskCreateDate={desk.deskCreateDate}
            deskFinishDate={desk.deskFinishDate}
            selectedDate={selectedDate}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            onDeskUpdate={handleDateUpdate}
            calendarButtonRef={calendarButtonRef}
            hasEditPermission={hasEditPermission}
            onDateSave={onDateOrStatusSave}
          />

          <StatusSelector
            currentStatus={currentStatus}
            statusMenuOpen={statusMenuOpen}
            toggleStatusMenu={toggleStatusMenu}
            statusButtonRef={statusButtonRef}
            hasEditPermission={hasEditPermission}
          />

          {statusMenuOpen && hasEditPermission && (
            <StatusMenu
              isOpen={statusMenuOpen}
              handleStatusChange={handleStatusChange}
              statusMenuRef={statusMenuRef}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeskHeader;
