import React, { useState } from "react";
import {
  SubscriptionInfoDto,
  SubscriptionType,
} from "../../../../../services/subscriptions/types.ts";
import { SubscriptionService } from "../../../../../services/subscriptions/Subscriptions.ts";
import { ThemedButton } from "../../../../../components/ui/ThemedButton.tsx";
import { ConfirmDialog } from "../../../../../components/ui/ConfirmDialog";

// Копируем стили из прошлой версии SubscriptionsPage
const getSubscriptionCardStyles = (type: SubscriptionType) => {
  // ... (как было раньше)
  switch (type) {
    case SubscriptionType.PRO:
      return {
        borderColor: "border-blue-500",
        bgColor: "bg-blue-50",
        buttonClass: "bg-blue-600 hover:bg-blue-700",
        titleColor: "text-blue-700",
      };
    case SubscriptionType.ULTRA:
      return {
        borderColor: "border-purple-500",
        bgColor: "bg-purple-50",
        buttonClass: "bg-purple-600 hover:bg-purple-700",
        titleColor: "text-purple-700",
      };
    case SubscriptionType.COMMON:
    default:
      return {
        borderColor: "border-gray-300",
        bgColor: "bg-gray-50",
        buttonClass: "bg-gray-600 hover:bg-gray-700",
        titleColor: "text-gray-700",
      };
  }
};

interface AllSubscriptionsViewProps {
  allPlans: SubscriptionInfoDto[];
  currentPlanType: SubscriptionType | null;
  onSubscriptionChange: () => void; // Для обновления данных после покупки/апдейта
}

export const AllSubscriptionsView: React.FC<AllSubscriptionsViewProps> = ({
  allPlans,
  currentPlanType,
  onSubscriptionChange,
}) => {
  const [buyingPlan, setBuyingPlan] = useState<SubscriptionType | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleBuyOrUpdatePlan = async (type: SubscriptionType) => {
    handleBuyClick(type);
  };

  const handleBuyClick = (type: SubscriptionType) => {
    setIsConfirmOpen(true);
    setBuyingPlan(type);
  };

  const handleConfirm = async () => {
    if (!buyingPlan) return; // Проверка на наличие выбранного плана

    console.log("Подтверждение покупки:", buyingPlan);
    setBuyError(null);
    const isCurrent = currentPlanType === buyingPlan;

    try {
      if (currentPlanType === null) {
        await SubscriptionService.createUserSubscription(buyingPlan);
        console.log(`Подписка ${buyingPlan} успешно оформлена!`);
      } else {
        await SubscriptionService.updateSubscription(buyingPlan);
        if (isCurrent) {
          console.log(`Подписка ${buyingPlan} успешно продлена!`);
        } else {
          console.log(`Подписка успешно обновлена до ${buyingPlan}!`);
        }
      }
      onSubscriptionChange();
    } catch (err: unknown) {
      console.error(
        `Ошибка при покупке/обновлении/продлении плана ${buyingPlan}:`,
        err
      );
      setBuyError(
        err instanceof Error
          ? err.message
          : `Не удалось ${isCurrent ? "продлить" : currentPlanType === null ? "оформить" : "обновить"} подписку ${buyingPlan}.`
      );
    } finally {
      setBuyingPlan(null);
    }
    console.log("Подтверждено!");
    setIsConfirmOpen(false);
  };

  const handleCancel = () => {
    setBuyingPlan(null);
    setIsConfirmOpen(false);
  };

  if (allPlans.length === 0) {
    return <p className="text-center p-6">Нет доступных подписок.</p>;
  }

  return (
    <div>
      {buyError && (
        <div className="text-red-600 bg-red-100 p-4 rounded border border-red-300 mb-4 flex-shrink-0">
          {buyError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5">
        {allPlans.map((sub) => {
          const styles = getSubscriptionCardStyles(sub.subscriptionType);
          const isFree = sub.price === 0;
          const isCurrentPlan = currentPlanType === sub.subscriptionType;
          const isBuyingThisPlan = buyingPlan === sub.subscriptionType;

          let buttonText = "Купить";
          if (isCurrentPlan) {
            buttonText = "Продлить подписку";
          } else if (currentPlanType !== null) {
            const currentVal =
              currentPlanType === "COMMON"
                ? 1
                : currentPlanType === "PRO"
                  ? 2
                  : 3;
            const targetVal =
              sub.subscriptionType === "COMMON"
                ? 1
                : sub.subscriptionType === "PRO"
                  ? 2
                  : 3;
            buttonText = targetVal > currentVal ? "Улучшить" : "Сменить план";
          }

          return (
            <div
              key={sub.subscriptionType}
              className={`border rounded-lg shadow-md p-6 flex flex-col ${styles.borderColor} ${styles.bgColor} ${isBuyingThisPlan ? "opacity-70" : ""}`}
            >
              <h3
                className={`text-2xl font-semibold mb-3 ${styles.titleColor}`}
              >
                {sub.subscriptionType}
              </h3>
              <p className="text-gray-600 mb-4">
                {sub.subscriptionType === SubscriptionType.COMMON
                  ? "Базовый план для старта"
                  : isFree
                    ? "Бесплатный доступ"
                    : `План ${sub.subscriptionType}`}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {isFree ? "Бесплатно" : `${sub.price} ₽`}
                </span>
                {!isFree && (
                  <span className="text-gray-500">/ {sub.daysLimit} дней</span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Лимит участников: {sub.deskLimit}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Длительность: {sub.daysLimit} дней
                </li>
              </ul>

              <ThemedButton
                onClick={() => handleBuyOrUpdatePlan(sub.subscriptionType)}
                disabled={buyingPlan !== null}
                className={`w-full py-2 px-4 rounded transition duration-200 flex justify-center items-center
                          ${
                            buyingPlan !== null
                              ? isBuyingThisPlan
                                ? `${styles.buttonClass} opacity-50 cursor-wait`
                                : "bg-gray-400 cursor-not-allowed"
                              : `${styles.buttonClass} text-white`
                          }
                          ${isCurrentPlan ? "!bg-green-600 hover:!bg-green-700" : ""}
                      `}
              >
                {isBuyingThisPlan ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isCurrentPlan ? "Продление..." : "Обработка..."}
                  </>
                ) : (
                  buttonText
                )}
              </ThemedButton>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Подтверждение покупки"
        message={`Вы уверены, что хотите ${currentPlanType === null ? "оформить" : currentPlanType === buyingPlan ? "продлить" : "изменить"} подписку ${buyingPlan}?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
