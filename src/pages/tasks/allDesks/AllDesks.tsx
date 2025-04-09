import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { CreateDeskModal } from "../../../components/modals/createDeskModal/CreateDeskModal";
import { RenameDeskModal } from "../../../components/modals/renameDeskModal/RenameDeskModal";
import { DeleteDeskModal } from "../../../components/modals/deleteDeskModal/DeleteDeskModal";
import { useDesks } from "../../../contexts/DeskContext";
import { AuthService } from "../../../services/auth/Auth";
import { DeskService } from "../../../services/desk/Desk";
import { DeskTable } from "./components/DeskTable";
import { SearchPanel } from "./components/SearchPanel";
import { DeskData } from "../../../contexts/DeskContext";
import { AvatarService } from "../../../services/Avatar/Avatar";

export const AllDesks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);
  const [selectedDeskName, setSelectedDeskName] = useState<string>("");
  const [selectedDeskDescription, setSelectedDeskDescription] =
    useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string | null>>(
    {}
  );
  const previousUrlsRef = useRef<Record<string, string | null>>({});

  // Получаем данные и функции из контекста
  const {
    desks,
    loading,
    addDesk,
    loadDesks,
    removeDesk,
    updateDesk: updateDeskInContext,
  } = useDesks();

  // Фильтрация досок
  const filteredDesks = useMemo(
    () =>
      desks.filter((desk) =>
        desk.deskName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [desks, searchQuery]
  );

  // --- Загрузка аватарок для видимых владельцев ---
  useEffect(() => {
    const fetchAvatars = async () => {
      // Получаем уникальные username владельцев из *отфильтрованных* досок
      const ownerUsernames = [
        ...new Set(
          filteredDesks
            .map((desk) => desk.username) // Используем поле username
            .filter((username): username is string => !!username) // Оставляем только существующие строки
        ),
      ];

      if (ownerUsernames.length === 0) {
        // Если владельцев нет, очищаем старые URL (если были)
        Object.values(previousUrlsRef.current).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setAvatarsMap({});
        previousUrlsRef.current = {};
        return; // Выходим, если нет username для запроса
      }

      console.log("[AllDesks] Запрос аватарок для владельцев:", ownerUsernames);

      try {
        const batchResponse = await AvatarService.getAllAvatars(ownerUsernames);
        const newAvatarsMap: Record<string, string | null> = {};
        const currentUrls = { ...previousUrlsRef.current }; // Копируем текущие для сравнения

        // Создаем Blob URL и очищаем старые
        for (const username in batchResponse) {
          const base64Data = batchResponse[username];
          let newUrl: string | null = null;

          if (base64Data) {
            // Важно: getAllAvatars возвращает base64 строку, не Blob напрямую
            // Нужно создать Blob из base64
            try {
              const byteString = atob(base64Data.split(",")[1]);
              const mimeString = base64Data
                .split(",")[0]
                .split(":")[1]
                .split(";")[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([ab], { type: mimeString });
              newUrl = URL.createObjectURL(blob);
              console.log(
                `[AllDesks] Создан Blob URL для ${username}: ${newUrl}`
              );
            } catch (e) {
              console.error(
                `[AllDesks] Ошибка создания Blob URL для ${username}:`,
                e
              );
              newUrl = null; // Ошибка -> нет URL
            }
          }

          // Отзываем *старый* URL для этого юзера, если он был и не совпадает с новым
          if (currentUrls[username] && currentUrls[username] !== newUrl) {
            console.log(
              `[AllDesks] Отзыв старого URL для ${username}: ${currentUrls[username]}`
            );
            URL.revokeObjectURL(currentUrls[username]!);
          }
          newAvatarsMap[username] = newUrl;
        }

        // Отзываем URL для юзеров, которых больше нет в списке видимых
        Object.keys(currentUrls).forEach((username) => {
          if (
            !newAvatarsMap.hasOwnProperty(username) &&
            currentUrls[username]
          ) {
            console.log(
              `[AllDesks] Отзыв URL для невидимого юзера ${username}: ${currentUrls[username]}`
            );
            URL.revokeObjectURL(currentUrls[username]!);
          }
        });

        setAvatarsMap(newAvatarsMap);
        previousUrlsRef.current = newAvatarsMap; // Сохраняем текущие как "предыдущие" для следующего раза
      } catch (error) {
        console.error("[AllDesks] Ошибка при загрузке аватарок:", error);
        // Очищаем аватарки при ошибке
        Object.values(previousUrlsRef.current).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setAvatarsMap({});
        previousUrlsRef.current = {};
      }
    };

    if (filteredDesks.length > 0) {
      fetchAvatars();
    } else {
      // Если нет видимых досок, очищаем карту аватарок и отзываем старые URL
      Object.values(previousUrlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      setAvatarsMap({});
      previousUrlsRef.current = {};
    }

    // Функция очистки при размонтировании
    return () => {
      console.log("[AllDesks] Размонтирование, очистка всех Object URL...");
      Object.values(previousUrlsRef.current).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      previousUrlsRef.current = {};
    };
  }, [filteredDesks]); // Перезапускаем эффект при изменении отфильтрованного списка

  const handleDeskCreated = useCallback(
    async (newDesk: DeskData) => {
      console.log("[AllDesks] Новая доска создана, обновляем список...");
      addDesk(newDesk); // Используем addDesk из контекста
      // Не нужно вызывать loadDesks(), так как addDesk уже обновил состояние
    },
    [addDesk]
  );

  // Обновленный обработчик для открытия модалки переименования
  const handleRenameRequest = useCallback(
    (id: number, initialName: string, initialDescription: string) => {
      console.log(
        `[AllDesks] Запрос на переименование ID: ${id}, Имя: "${initialName}", Описание: "${initialDescription}"`
      );
      setSelectedDeskId(id);
      setSelectedDeskName(initialName);
      setSelectedDeskDescription(initialDescription);
      setIsRenameModalOpen(true);
    },
    []
  );

  // Обработчик успешного переименования из модального окна
  const handleRenameSuccess = useCallback(
    (updatedDesk: Partial<DeskData>) => {
      loadDesks();
      setIsRenameModalOpen(false);
    },
    [loadDesks]
  );

  // Обновленный обработчик для открытия модалки удаления
  const handleDeleteRequest = useCallback((id: number, deskName: string) => {
    setSelectedDeskId(id);
    setSelectedDeskName(deskName);
    setIsDeleteModalOpen(true);
  }, []);

  // Подтверждение удаления доски
  const handleConfirmDelete = useCallback(
    async (id: number) => {
      setIsDeleting(true);
      try {
        removeDesk(id);
        await DeskService.deleteDesk(id);
        console.log(`Доска ${id} успешно удалена.`);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Ошибка при удалении доски:", error);
        loadDesks();
        alert("Не удалось удалить доску");
      } finally {
        setIsDeleting(false);
      }
    },
    [removeDesk, loadDesks]
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden ">
      <div className="w-full pb-4">
        <div className="mb-4 ml-2">
          <h1 className="text-2xl font-semibold text-gray-900">Все доски</h1>
        </div>

        <SearchPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddDesk={() => setIsCreateModalOpen(true)}
        />
      </div>

      <DeskTable
        desks={filteredDesks}
        loading={loading}
        onRename={handleRenameRequest}
        onDelete={handleDeleteRequest}
        avatarsMap={avatarsMap}
      />

      {/* Модальные окна */}
      <CreateDeskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeskCreated={handleDeskCreated}
      />
      <RenameDeskModal
        key={isRenameModalOpen ? `rename-${selectedDeskId}` : "rename-closed"}
        isOpen={isRenameModalOpen}
        deskId={selectedDeskId}
        initialDeskName={selectedDeskName}
        onClose={() => setIsRenameModalOpen(false)}
        onSuccess={handleRenameSuccess}
      />
      <DeleteDeskModal
        isOpen={isDeleteModalOpen}
        deskId={selectedDeskId}
        deskName={selectedDeskName}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
