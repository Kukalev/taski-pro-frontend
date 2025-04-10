import React, {useEffect, useState} from 'react'
import {
    MdCheckCircleOutline,
    MdLockReset,
    MdOutlineEmail,
    MdOutlineInfo,
    MdPassword
} from 'react-icons/md' // Добавили иконки
import {SlLock} from 'react-icons/sl'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {Input} from '../../components/ui/Input'
import {
    CodeType,
    UserSettingsService
} from '../../services/userSettings/UserSettings'
import {ApiError} from '../../types/auth.types'

// Тип для шагов страницы - ДОБАВЛЕН ШАГ enterCode
type ForgotPasswordStep = 'enterEmail' | 'enterCode' | 'enterNewPassword' | 'success'; // Добавим шаг успеха

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // Состояния для шагов и полей
    const [pageStep, setPageStep] = useState<ForgotPasswordStep>('enterEmail');
    const [email, setEmail] = useState<string>(''); // Email сохраняем между шагами
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Используем для временных успехов
    const [isMessageVisible, setIsMessageVisible] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: false,
        code: false,
        newPassword: false,
        confirmPassword: false,
    });

    // Эффект для плавного появления сообщений
    useEffect(() => {
        if (error || successMessage) {
            setTimeout(() => setIsMessageVisible(true), 50);
        } else {
            setIsMessageVisible(false);
        }
    }, [error, successMessage]);

    // Сброс при смене шага (кроме email)
    useEffect(() => {
        setError(null);
        setSuccessMessage(null); // Сбрасываем успех при переходе
        setIsMessageVisible(false);
        // Сбрасываем ошибки полей, но не сам email
        setFieldErrors({ email: fieldErrors.email, code: false, newPassword: false, confirmPassword: false });
        // Очищаем поля для нового шага (кроме email)
        if (pageStep !== 'enterNewPassword') setCode('');
        if (pageStep !== 'success') {
           setNewPassword('');
           setConfirmPassword('');
        }
    }, [pageStep]);

    // --- Шаг 1: Ввод Email ---

    const validateEmailForm = (): boolean => {
        const isEmailEmpty = !email.trim();
        const isEmailInvalid = !isEmailEmpty && !/\S+@\S+\.\S+/.test(email);
        setFieldErrors({ ...fieldErrors, email: isEmailEmpty || isEmailInvalid });
        if (isEmailEmpty) { setError('Необходимо заполнить поле Email'); return false; }
        if (isEmailInvalid) { setError('Введите корректный адрес электронной почты'); return false; }
        setError(null); // Сброс общей ошибки если валидация поля прошла
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value.trim()) setFieldErrors({ ...fieldErrors, email: false });
        if (error) setError(null);
    };

    const handleSendCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsMessageVisible(false);
        if (!validateEmailForm()) {
            setTimeout(() => setIsMessageVisible(true), 50);
            return;
        }
        setIsLoading(true);
        try {
            console.log(`[ForgotPasswordPage] Отправка запроса на сброс пароля для email: ${email}`);
            await UserSettingsService.forgotPassword(email);
            console.log(`[ForgotPasswordPage] Запрос на сброс для ${email} успешно отправлен.`);
            setSuccessMessage('Код для сброса пароля отправлен на вашу почту.'); // Сообщение об успехе шага
            setFieldErrors({ ...fieldErrors, email: false });
            setPageStep('enterCode'); // ---> Переключаем на шаг ВВОДА КОДА <---
            setTimeout(() => setIsMessageVisible(true), 50);
        } catch (err: unknown) {
            handleApiError(err, 'Не удалось отправить код.');
            setTimeout(() => setIsMessageVisible(true), 50);
        } finally {
            setIsLoading(false);
        }
    };


    const validateCodeForm = (): boolean => {
        const isCodeEmpty = !code.trim();
        setFieldErrors({ ...fieldErrors, code: isCodeEmpty });
        if (isCodeEmpty) { setError('Введите код из письма'); return false; }
        setError(null);
        return true;
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCode(value);
        if (value.trim()) setFieldErrors({ ...fieldErrors, code: false });
        if (error) setError(null);
        if (successMessage) setSuccessMessage(null);
    };

    const handleVerifyCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsMessageVisible(false);

        if (!validateCodeForm()) {
            setTimeout(() => setIsMessageVisible(true), 50);
            return;
        }
        setIsLoading(true);

        try {
            console.log(`[ForgotPasswordPage] Проверка кода: ${code} для email: ${email}`);
            const isCodeValid = await UserSettingsService.isValidCode({
                email: email,
                code: code,
                type: CodeType.RESET_PASSWORD
            });

            if (!isCodeValid) {
                setError('Введен неверный или истекший код подтверждения.');
                setFieldErrors({...fieldErrors, code: true});
                setTimeout(() => setIsMessageVisible(true), 50);
                return; // Остаемся на этом шаге
            }

            console.log(`[ForgotPasswordPage] Код ${code} верный для email ${email}.`);
            setSuccessMessage('Код подтвержден. Теперь введите новый пароль.'); // Сообщение об успехе шага
            setPageStep('enterNewPassword'); // ---> Переключаем на шаг ВВОДА ПАРОЛЯ <---
            setTimeout(() => setIsMessageVisible(true), 50);

        } catch (err: unknown) {
             handleApiError(err, 'Не удалось проверить код.');
             setTimeout(() => setIsMessageVisible(true), 50);
        } finally {
            setIsLoading(false);
        }
    };



    const validatePasswordForm = (): boolean => {
        const errors = {
            ...fieldErrors, // Сохраняем предыдущие ошибки (хотя они должны быть сброшены)
            newPassword: !newPassword.trim(),
            confirmPassword: !confirmPassword.trim() || newPassword !== confirmPassword,
        };
        setFieldErrors(errors);

        if (errors.newPassword) { setError('Введите новый пароль'); return false; }
        if (errors.confirmPassword && !confirmPassword.trim()) { setError('Подтвердите новый пароль'); return false; }
        if (errors.confirmPassword && newPassword !== confirmPassword) { setError('Пароли не совпадают'); return false; }

        setError(null);
        return true;
    };

     const handlePasswordChange = (field: 'newPassword' | 'confirmPassword') => (e: React.ChangeEvent<HTMLInputElement>) => {
         const value = e.target.value;
         if (field === 'newPassword') setNewPassword(value);
         if (field === 'confirmPassword') setConfirmPassword(value);

         // Сброс ошибки для конкретного поля и общей ошибки при вводе
         if (value.trim()) setFieldErrors({ ...fieldErrors, [field]: false });
         if (error) setError(null);
         if (successMessage) setSuccessMessage(null); // Убираем сообщение о верном коде
     };

    // ПЕРЕИМЕНОВАННЫЙ/ИЗМЕНЕННЫЙ ОБРАБОТЧИК для установки нового пароля
    const handleSetNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null); // Сброс предыдущих
        setIsMessageVisible(false);

        if (!validatePasswordForm()) {
            setTimeout(() => setIsMessageVisible(true), 50);
            return;
        }
        setIsLoading(true);

        try {
            // Код уже проверен на предыдущем шаге
            console.log(`[ForgotPasswordPage] Попытка обновления пароля для email ${email}...`);
            await UserSettingsService.updatePasswordWithoutAuth({ email, newPassword }); // Используем newPassword
            console.log(`[ForgotPasswordPage] Пароль для ${email} успешно обновлен.`);

            // Финальный успех!
            setPageStep('success'); // ---> Переключаем на шаг УСПЕХА <---
             // Очищаем все для безопасности (email оставим для сообщения)
            setCode('');
            setNewPassword('');
            setConfirmPassword('');

            // Не нужно больше successMessage, т.к. есть отдельный шаг
            // setTimeout(() => setIsMessageVisible(true), 50); // Не нужно, шаг успеха сам отобразится

        } catch (err: unknown) {
             handleApiError(err, 'Не удалось обновить пароль.');
             setTimeout(() => setIsMessageVisible(true), 50);
        } finally {
            setIsLoading(false);
        }
    };

    // Вспомогательная функция обработки ошибок API
    const handleApiError = (err: unknown, defaultMessage: string) => {
         const apiError = err as ApiError;
         console.error(`[ForgotPasswordPage] Ошибка API:`, apiError);
         setError(apiError.response?.data?.message || apiError.message || defaultMessage);
    }

    // --- Рендеринг ---
    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            <div className='w-full max-w-[380px] -mt-48'>

                 {/* Заголовок в зависимости от шага */}
                 <div className='text-left mb-4 flex items-center space-x-2 px-1 text-[#4d505e]'>
                    {pageStep === 'enterEmail' && <><SlLock className="text-xl" /><h1 className='text-[19px] font-semibold '>Забыли пароль?</h1></>}
                    {pageStep === 'enterCode' && <><MdPassword className="text-2xl" /><h1 className='text-[19px] font-semibold '>Введите код</h1></>}
                    {pageStep === 'enterNewPassword' && <><MdLockReset className="text-2xl" /><h1 className='text-[19px] font-semibold '>Новый пароль</h1></>}
                    {pageStep === 'success' && <><MdCheckCircleOutline className="text-2xl text-green-500" /><h1 className='text-[19px] font-semibold '>Пароль изменен</h1></>}
                </div>

                {/* --- Форма для ввода Email --- */}
                {pageStep === 'enterEmail' && (
                    <form onSubmit={handleSendCodeSubmit} className='bg-gray-100 rounded-xl p-6 shadow-sm'>
                        <p className="text-gray-600 text-sm mb-5 text-left">
                            Введите свой адрес электронной почты и мы отправим Вам код для сброса пароля.
                        </p>
                        <div className='space-y-4'>
                            <Input
                                type='email'
                                placeholder='Электронная почта'
                                value={email}
                                onChange={handleEmailChange}
                                icon={<MdOutlineEmail />}
                                error={fieldErrors.email}
                            />
                        </div>
                        {error && (
                            <div className={`mt-4 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <MdOutlineInfo className='text-xl flex-shrink-0 mt-0' /> <p className='text-sm text-left'>{error}</p>
                            </div>
                        )}
                        <div className='mt-5'>
                            <Button type='submit' fullWidth disabled={isLoading}>
                                {isLoading ? 'Отправка...' : 'Отправить код'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* --- Форма для ввода Кода --- */}
                {pageStep === 'enterCode' && (
                    <form onSubmit={handleVerifyCodeSubmit} className='bg-gray-100 rounded-xl p-6 shadow-sm'>
                        {/* Показываем сообщение об отправке кода */}
                        {successMessage && (
                            <div className={`mb-4 flex items-start space-x-2 text-green-600 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <MdCheckCircleOutline className='text-xl flex-shrink-0 mt-0' />
                                <p className='text-sm text-left'>{successMessage}</p>
                            </div>
                        )}
                         <p className="text-gray-600 text-sm mb-5 text-left">
                           Мы отправили код на <strong>{email}</strong>. Введите его ниже.
                         </p>
                        <div className='space-y-4'>
                            <Input
                                type='text' // Можно type="number" но text надежнее для кодов
                                placeholder='Код из письма'
                                value={code}
                                onChange={handleCodeChange}
                                icon={<MdPassword />} // Иконка кода/пароля
                                error={fieldErrors.code}
                                // autoComplete="one-time-code" // Подсказка для браузеров
                            />
                        </div>
                        {error && (
                            <div className={`mt-4 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <MdOutlineInfo className='text-xl flex-shrink-0 mt-0' /> <p className='text-sm text-left'>{error}</p>
                            </div>
                        )}
                        <div className='mt-5'>
                            <Button type='submit' fullWidth disabled={isLoading}>
                                {isLoading ? 'Проверка...' : 'Проверить код'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* --- Форма для ввода Нового пароля --- */}
                {pageStep === 'enterNewPassword' && (
                     <form onSubmit={handleSetNewPasswordSubmit} className='bg-gray-100 rounded-xl p-6 shadow-sm'>
                         {/* Показываем сообщение об успехе проверки кода */}
                        {successMessage && (
                            <div className={`mb-4 flex items-start space-x-2 text-green-600 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <MdCheckCircleOutline className='text-xl flex-shrink-0 mt-0' />
                                <p className='text-sm text-left'>{successMessage}</p>
                            </div>
                        )}
                         <p className="text-gray-600 text-sm mb-5 text-left">
                           Придумайте новый надежный пароль.
                         </p>
                        <div className='space-y-4 mb-5'>
                            <Input
                                type='password'
                                placeholder='Новый пароль'
                                value={newPassword}
                                onChange={handlePasswordChange('newPassword')}
                                icon={<SlLock />}
                                error={fieldErrors.newPassword}
                            />
                            <Input
                                type='password'
                                placeholder='Подтвердите новый пароль'
                                value={confirmPassword}
                                onChange={handlePasswordChange('confirmPassword')}
                                icon={<SlLock />}
                                error={fieldErrors.confirmPassword}
                            />
                        </div>
                         {error && (
                            <div className={`mt-4 mb-5 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <MdOutlineInfo className='text-xl flex-shrink-0 mt-0' /> <p className='text-sm text-left'>{error}</p>
                            </div>
                        )}
                        <Button type='submit' fullWidth disabled={isLoading}>
                            {isLoading ? 'Сохранение...' : 'Изменить пароль'}
                        </Button>
                    </form>
                )}

                 {/* --- Сообщение об успехе --- */}
                 {pageStep === 'success' && (
                     <div className='bg-gray-100 rounded-xl p-6 shadow-sm text-center'>
                         <MdCheckCircleOutline className="text-4xl text-green-500 mx-auto mb-3" />
                         <p className="text-gray-700 text-base mb-5">
                             Пароль для учетной записи <strong>{email}</strong> успешно изменен!
                         </p>
                         <Button onClick={() => navigate('/login')} fullWidth>
                             Перейти ко входу
                         </Button>
                     </div>
                 )}


                 {/* Ссылка "Вернуться ко входу" видна на всех шагах, кроме успеха */}
                {pageStep !== 'success' && (
                    <p className='text-center text-xm text-gray-500 mt-5'>
                        Вернуться ко{' '}
                        <Link to='/login' className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
                            входу
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}; 