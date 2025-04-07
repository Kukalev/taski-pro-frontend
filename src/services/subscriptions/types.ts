// Типы подписок
export enum SubscriptionType {
	COMMON = 'COMMON',
	PRO = 'PRO',
	ULTRA = 'ULTRA'
}

// DTO с информацией о доступных подписках (обновлено согласно API)
export interface SubscriptionInfoDto {
	subscriptionType: SubscriptionType; // 'COMMON', 'PRO', 'ULTRA'
	deskLimit: number;                // Макс. кол-во досок
	daysLimit: number;                // Длительность подписки в днях
	price: number;                    // Цена
}

// Убираем или комментируем константу SUBSCRIPTION_PLANS, т.к. данные берем с API
/*
export const SUBSCRIPTION_PLANS: SubscriptionInfoDto[] = [
	{
		id: 1,
		subscriptionType: SubscriptionType.COMMON,
		description: 'Базовый тариф для небольших команд',
		maxDesks: 3, // Теперь deskLimit
		maxUsersOnDesk: 10, // Этого поля нет
		price: 0 // Цена в ответе другая
	},
	{
		id: 2,
		subscriptionType: SubscriptionType.PRO,
		description: 'Профессиональный тариф для средних команд',
		maxDesks: 7,
		maxUsersOnDesk: 20,
		price: 20
	},
	{
		id: 3,
		subscriptionType: SubscriptionType.ULTRA,
		description: 'Максимальный тариф для больших проектов',
		maxDesks: 15,
		maxUsersOnDesk: 30,
		price: 35
	}
];
*/

// DTO с информацией о подписке пользователя (ОБНОВЛЕНО согласно API)
export interface UserSubscriptionResponseDto {
	subscriptionType: SubscriptionType; // Тип подписки
	startDate: string;                // Дата начала (ISO формат)
	finishDate: string;               // Дата окончания (ISO формат)
	// Убираем все поля, которых нет в реальном ответе API:
	// id, active, description, maxDesks, maxUsersOnDesk, price, userSubscriptionStartDate, userSubscriptionFinishDate
}