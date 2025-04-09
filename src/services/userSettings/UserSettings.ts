import {getCurrentUser} from './api/GetCurrentUser'
import {sendCodeForEmailChange} from './api/SendCodeEmail'
import {forgotPassword} from './api/ForgotPassword'
import {isValidCode} from './api/IsValidCode'
import {updateUser} from './api/UpdateUser'
import {deleteCurrentUser} from './api/DeleteUser'
import {updatePasswordWithoutAuth} from './api/UpdatePasswordWithoutAuth'
import {CodeType, UpdateUserData, UserProfile} from './types' // Реэкспорт типов для удобства

// Реэкспорт функций API
export const UserSettingsService = {
    getCurrentUser,
    sendCodeForEmailChange,
    forgotPassword,
    isValidCode,
    updateUser,
	deleteCurrentUser,
    updatePasswordWithoutAuth
};

// Реэкспорт типов
export { CodeType };
export type { UpdateUserData, UserProfile };

/*
Пример использования:

import { UserSettingsService } from './services/userSettings/UserSettings';

async function resetPass(email: string, newPass: string) {
    try {
        await UserSettingsService.updatePasswordWithoutAuth({ email, newPassword: newPass });
        // Показать сообщение об успехе
    } catch (error) {
        // Показать сообщение об ошибке
        console.error(error);
    }
}

*/



