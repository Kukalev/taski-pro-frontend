import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DeskData } from "../../../../contexts/DeskContext";
import { getDeskColor } from "../../../../utils/deskColors";
import { AuthService } from "../../../../services/auth/Auth";
import { isCurrentUser } from "../../../../utils/permissionUtils";
import { UserAvatar } from "../../../../components/header/components/UserAvatar";

interface DeskRowProps {
  desk: DeskData;
  onRename?: (
    deskId: number,
    initialName: string,
    initialDescription: string
  ) => void;
  onDelete?: (deskId: number, deskName: string) => void;
  avatarsMap: Record<string, string | null>;
}

export const DeskRow = React.memo(
  ({ desk, onRename, onDelete, avatarsMap }: DeskRowProps) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Получаем имя текущего пользователя ОДИН РАЗ
    const currentUsername = useMemo(() => AuthService.getUsername(), []);

    // Определяем владельца ИЗ ДАННЫХ ДОСКИ - ИСПОЛЬЗУЕМ ПОЛЕ 'username'
    const ownerUsername = desk.username || null; // Владелец - это строка (username), а не deskOwner
    const hasEditPermission = useMemo(() => {
      // Упрощенная проверка: права есть, если владелец доски совпадает с текущим пользователем
      // В идеале нужна проверка роли (CREATOR/CONTRIBUTOR) через deskUsers
      return !!ownerUsername && ownerUsername === currentUsername;
    }, [ownerUsername, currentUsername]);

    // Форматирование даты
    const formatDate = (date: Date | string | null) => {
      if (!date) return "-";
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        return "-";
      }
    };

    // Форматируем диапазон дат
    const formatDateRange = () => {
      const startDate = formatDate(desk.deskCreateDate);
      const endDate = desk.deskFinishDate
        ? formatDate(desk.deskFinishDate)
        : null;

      if (startDate === "-") return "-";
      return endDate ? `${startDate} - ${endDate}` : startDate;
    };

    const handleDeskClick = () => {
      navigate(`/desk/${desk.id}/overview`);
    };

    const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasEditPermission) return;
      setShowMenu((prev) => !prev);
    };

    // Закрытие меню при клике вне него
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setShowMenu(false);
        }
      };

      if (showMenu) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showMenu]);

    // Обновляем вызовы onRename и onDelete, чтобы передавать нужные данные
    const handleRename = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRename) {
        onRename(desk.id, desk.deskName, desk.deskDescription || "");
      }
      setShowMenu(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(desk.id, desk.deskName);
      }
      setShowMenu(false);
    };

    // Получаем URL аватара для владельца
    const ownerAvatarUrl = ownerUsername ? avatarsMap[ownerUsername] : null;

    return (
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
        onClick={handleDeskClick}
      >
        <td className="py-3 px-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 ${getDeskColor(desk.id)} rounded flex items-center justify-center mr-3 shrink-0 `}
              >
                {desk.deskName.charAt(0).toUpperCase()}
              </div>
              <span
                className="font-medium text-gray-800 truncate max-w-[300px] block"
                title={desk.deskName}
              >
                {desk.deskName}
              </span>
            </div>

            {hasEditPermission && (
              <button
                ref={buttonRef}
                onClick={handleMenuClick}
                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="6" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="18" r="1" />
                </svg>
              </button>
            )}

            {showMenu && hasEditPermission && (
              <div
                ref={menuRef}
                className="absolute right-4 top-full mt-1 z-50 bg-white rounded-md shadow-lg border border-gray-100 w-44"
              >
                <div className="py-1">
                  {onRename && (
                    <button
                      onClick={handleRename}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        className="mr-2 w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Переименовать
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        className="mr-2 w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 bg-green-500 rounded-full mr-2`}></div>
            <span className="text-gray-700 truncate">В работе</span>
          </div>
        </td>
        <td className="py-3 px-4 text-gray-700 truncate">
          {formatDateRange()}
        </td>
        <td className="py-3 px-4">
          {ownerUsername ? (
            <div className="flex items-center">
              <UserAvatar
                username={ownerUsername}
                avatarUrl={ownerAvatarUrl}
                size="sm"
              />
              <span
                className="text-gray-700 truncate ml-2"
                title={ownerUsername}
              >
                {ownerUsername}
              </span>
              {currentUsername && isCurrentUser(ownerUsername) && (
                <span className="ml-1 text-gray-400 text-xs">(Вы)</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Неизвестен</span>
          )}
        </td>
      </tr>
    );
  }
);

DeskRow.displayName = "DeskRow";
