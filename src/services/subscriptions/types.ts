// Типы подписок
export enum SubscriptionType {
	COMMON = 'COMMON',
	PRO = 'PRO',
	ULTRA = 'ULTRA'
}

// DTO с информацией о доступных подписках
export interface SubscriptionInfoDto {
	id: number;
	subscriptionType: SubscriptionType;
	description: string;
	maxDesks: number;
	maxUsersOnDesk: number;
	price: number;
}

// Константы подписок для использования в UI
export const SUBSCRIPTION_PLANS: SubscriptionInfoDto[] = [
	{
		id: 1,
		subscriptionType: SubscriptionType.COMMON,
		description: 'Базовый тариф для небольших команд',
		maxDesks: 3,
		maxUsersOnDesk: 10,
		price: 0
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

// DTO с информацией о подписке пользователя
export interface UserSubscriptionResponseDto {
	id: number;
	subscriptionType: SubscriptionType;
	userSubscriptionStartDate: string; // ISO формат даты
	userSubscriptionFinishDate: string; // ISO формат даты
	active: boolean;
	description: string;
	maxDesks: number;
	maxUsersOnDesk: number;
	price: number;
}