/**
 * Типы кодов подтверждения, отправляемых на почту.
 */
export enum CodeType {
    CONFIRM_MAIL = 'CONFIRM_MAIL',   // Подтверждение новой почты (если нужно)
    RESET_PASSWORD = 'RESET_PASSWORD', // Сброс пароля
    RESET_MAIL = 'RESET_MAIL'       // Подтверждение смены текущей почты
}

/**
 * Данные профиля пользователя.
 */
export interface UserProfile {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}

/**
 * Данные для обновления профиля пользователя.
 * Все поля опциональны, кроме случаев смены пароля или почты.
 */
export interface UpdateUserData {
    username?: string;
    firstname?: string;
    lastname?: string;
    oldPassword?: string; // Обязательно при смене пароля
    newPassword?: string; // Обязательно при смене пароля
    email?: string;      // Новая почта (после подтверждения кодом)
}

/**
 * Тип ответа для проверки кода.
 */
export interface IsValidCodeResponse {
    isValid: boolean; // API возвращает true/false напрямую, обернем для ясности
}


/**
 * Данные, необходимые для удаления аккаунта пользователя.
 */
export interface DeleteUserPayload {
	oldPassword: string;
}
