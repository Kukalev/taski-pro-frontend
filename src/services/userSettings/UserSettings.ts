import {getCurrentUser} from './api/GetCurrentUser'
import {sendCodeForEmailChange} from './api/SendCodeEmail'
import {forgotPassword} from './api/ForgotPassword'
import {isValidCode} from './api/IsValidCode'
import {updateUser} from './api/UpdateUser'
import {deleteCurrentUser} from './api/DeleteUser'
import {CodeType, UpdateUserData, UserProfile} from './types' // Реэкспорт типов для удобства

// Реэкспорт функций API
export const UserSettingsService = {
    getCurrentUser,
    sendCodeForEmailChange,
    forgotPassword,
    isValidCode,
    updateUser,
	deleteCurrentUser
};

// Реэкспорт типов
export { CodeType };
export type { UpdateUserData, UserProfile };

/*
Пример использования:

import { UserSettingsService, CodeType } from './services/userSettings/UserSettings';

async function loadProfile() {
    const profile = await UserSettingsService.getCurrentUser();
    console.log(profile.username);
}

async function startEmailChange() {
    await UserSettingsService.sendCodeForEmailChange();
    // Показать поле для ввода кода
}

async function verifyResetCode(code: string) {
    const isValid = await UserSettingsService.isValidCode(code, CodeType.RESET_MAIL);
    if (isValid) {
        // Разрешить ввод нового email
    }
}

async function changePassword(oldPass: string, newPass: string) {
    await UserSettingsService.updateUser({ oldPassword: oldPass, newPassword: newPass });
}

*/


