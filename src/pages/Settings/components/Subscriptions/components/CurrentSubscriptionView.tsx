import React, { useState } from "react";
import { UserSubscriptionResponseDto } from "../../../../../services/subscriptions/types.ts";
import { SubscriptionService } from "../../../../../services/subscriptions/Subscriptions.ts";
import { ThemedButton } from "../../../../../components/ui/ThemedButton.tsx";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal.tsx";
import { ConfirmDialog } from "../../../../../components/ui/ConfirmDialog.tsx";

interface CurrentSubscriptionViewProps {
  subscription: UserSubscriptionResponseDto | null;
  loading: boolean; // Загрузка информации о подписке
  onSubscriptionChange: () => void; // Функция для обновления данных после отмены
}

export const CurrentSubscriptionView: React.FC<
  CurrentSubscriptionViewProps
> = ({ subscription, loading, onSubscriptionChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const confirmCancelSubscription = async () => {
    if (!subscription) return;

    setIsLoadingAction(true);
    setActionError(null);
    try {
      await SubscriptionService.cancelSubscription();
      onSubscriptionChange();
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Ошибка отмены подписки:", err);
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelClick = () => {
    if (!subscription) return;
    setActionError(null);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"; // Возвращаем N/A если даты нет
    // Формат YYYY-MM-DDTHH:mm:ss.micros должен парситься стандартным new Date()
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Не удалось распарсить дату:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "?";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long", // Только день и месяц
      });
    } catch (e) {
      console.error("Ошибка форматирования короткой даты:", e);
      return "?";
    }
  };

  const calculateRemainingDays = (finishDateString?: string): number | null => {
    if (!finishDateString) return null;
    try {
      const finishDate = new Date(finishDateString);
      const now = new Date();

      // Устанавливаем время на начало дня для корректного сравнения
      finishDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (isNaN(finishDate.getTime())) return null;

      // Если дата окончания уже прошла, возвращаем 0
      if (finishDate < now) return 0;

      const diffTime = finishDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Округляем вверх
      return diffDays;
    } catch (e) {
      console.error("Ошибка расчета оставшихся дней:", e);
      return null;
    }
  };

  const isCurrentlyActive = (
    sub: UserSubscriptionResponseDto | null
  ): boolean => {
    if (!sub || !sub.startDate || !sub.finishDate) {
      return false;
    }
    try {
      const now = new Date();
      const start = new Date(sub.startDate);
      const finish = new Date(sub.finishDate);
      // Проверяем валидность дат перед сравнением
      if (isNaN(start.getTime()) || isNaN(finish.getTime())) return false;
      return now >= start && now <= finish;
    } catch (e) {
      console.error("Ошибка при сравнении дат:", e);
      return false; // Считаем неактивной при ошибке
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-left">Загрузка информации о вашем тарифе...</div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6 bg-white rounded-lg text-left">
        <p className="text-gray-600">У вас нет активной подписки.</p>
        {/* Можно добавить кнопку "Выбрать подписку", которая переключит таб */}
      </div>
    );
  }

  const isActive = isCurrentlyActive(subscription);
  const remainingDays = calculateRemainingDays(subscription.finishDate);

  return (
    <div className="pt-5">
      <div className="p-6 border rounded-lg  shadow-md bg-white max-w-[320px] ">
        <h3 className="text-xl font-semibold mb-4 text-left text-gray-800">
          Ваш текущий тариф: {subscription.subscriptionType}
        </h3>
        <div className="space-y-2 text-gray-700 mb-5 text-left">
          {/* Используем вычисленный статус */}
          <p>
            <strong>Статус:</strong>{" "}
            {isActive ? (
              <span className="text-green-600">Активна</span>
            ) : (
              <span className="text-red-600">Неактивна</span>
            )}
          </p>
          {/* Новое отображение дат */}
          <p>
            <strong>Дата:</strong> c {formatShortDate(subscription.startDate)}{" "}
            до {formatShortDate(subscription.finishDate)}
          </p>
          {/* Отображение оставшихся дней (только если активна и есть дни) */}
          {isActive && remainingDays !== null && remainingDays >= 0 && (
            <p>
              <strong>Осталось дней:</strong> {remainingDays}
            </p>
          )}
          {/* Убираем поля, которых нет в ответе API */}
          {/* <p><strong>Лимит досок:</strong> {subscription.maxDesks ?? 'N/A'}</p> */}
          {/* <p><strong>Цена:</strong> {subscription.price ?? 0} ₽</p> */}
          {/* <p><strong>Описание:</strong> {subscription.description || '-'}</p> */}
        </div>

        {isActive && (
          <ThemedButton
            onClick={handleCancelClick}
            disabled={isLoadingAction}
            className={`w-full py-2 px-4 rounded transition duration-200 flex justify-center items-center bg-red-600 hover:bg-red-700 text-white disabled:opacity-70`}
          >
            Отменить подписку
          </ThemedButton>
        )}
      </div>

      <ConfirmDialog
        isOpen={isModalOpen}
        title="Подтверждение отмены подписки"
        message="Вы уверены, что хотите отменить свою подписку?"
        onConfirm={confirmCancelSubscription}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};
