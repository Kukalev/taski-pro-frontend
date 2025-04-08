import React, {useEffect, useState} from 'react'
import {MdLockReset, MdOutlineEmail, MdOutlineInfo} from 'react-icons/md' // Иконки
import {SlLock} from 'react-icons/sl' // Иконка замка для заголовка
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button' // Используем твою кнопку
import {Input} from '../../components/ui/Input' // Используем твой инпут
// Импортируем сервис для сброса пароля
import {
    CodeType,
    UserSettingsService
} from '../../services/userSettings/UserSettings'
import {ApiError} from '../../types/auth.types' // Используем твой тип ошибки

// Тип для шагов страницы
type ForgotPasswordStep = 'enterEmail' | 'enterCodeAndPassword'

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // Состояния для шагов и полей
    const [pageStep, setPageStep] = useState<ForgotPasswordStep>('enterEmail');
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

    // Сброс при смене шага
    useEffect(() => {
        setError(null);
        setSuccessMessage(null);
        setIsMessageVisible(false);
        setFieldErrors({ email: false, code: false, newPassword: false, confirmPassword: false });
        // Не сбрасываем email, он может понадобиться
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
    }, [pageStep]);

    // Валидация формы (простая проверка на пустоту и формат email)
    const validateEmailForm = (): boolean => {
        const isEmailEmpty = !email.trim();
        // Простая проверка формата email
        const isEmailInvalid = !isEmailEmpty && !/\S+@\S+\.\S+/.test(email);

        setFieldErrors({ ...fieldErrors, email: isEmailEmpty || isEmailInvalid });

        if (isEmailEmpty) {
            setError('Необходимо заполнить поле Email');
            return false;
        }
        if (isEmailInvalid) {
             setError('Введите корректный адрес электронной почты');
             return false;
        }

        return true;
    };

    // Обработчик изменения поля email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        // Сбрасываем ошибку поля при вводе
        if (value.trim()) {
            setFieldErrors({ ...fieldErrors, email: false });
        }
        // Сбрасываем ошибки валидации и отправки
        if (error) setError(null);
        if (successMessage) setSuccessMessage(null);
    };

    // Обработчик отправки формы
    const handleSendCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Сначала сбрасываем предыдущие сообщения
        setError(null);
        setSuccessMessage(null);
        setIsMessageVisible(false); // Скрываем блок сообщений перед новой валидацией/отправкой

        const isValid = validateEmailForm();
        if (!isValid) {
            // Показываем ошибку валидации плавно
            setTimeout(() => setIsMessageVisible(true), 50);
            return;
        }

        setIsLoading(true);

        try {
            console.log(`[ForgotPasswordPage] Отправка запроса на сброс пароля для email: ${email}`);
            // Вызываем сервис forgotPassword
            await UserSettingsService.forgotPassword(email);
            console.log(`[ForgotPasswordPage] Запрос на сброс для ${email} успешно отправлен.`);
            setSuccessMessage('Код для сброса пароля отправлен. Введите его ниже вместе с новым паролем.');
            setEmail(''); // Очищаем поле после успеха
            setFieldErrors({ ...fieldErrors, email: false });
            setPageStep('enterCodeAndPassword'); // Переключаем на следующий шаг
             // Делаем сообщение видимым
             setTimeout(() => setIsMessageVisible(true), 50);

        } catch (err: unknown) {
            const apiError = err as ApiError; // Используем твой тип ApiError
            console.error('[ForgotPasswordPage] Ошибка при запросе сброса пароля:', apiError);
            // Устанавливаем ошибку отправки
            setError(apiError.response?.data?.message || apiError.message || 'Не удалось отправить код. Проверьте email или попробуйте позже.');
            // Делаем сообщение видимым
            setTimeout(() => setIsMessageVisible(true), 50);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Шаг 2: Ввод кода и нового пароля ---

    const validateResetForm = (): boolean => {
        const errors = {
            email: false, // Email уже есть
            code: !code.trim(),
            newPassword: !newPassword.trim(),
            confirmPassword: !confirmPassword.trim() || newPassword !== confirmPassword,
        };
        setFieldErrors(errors);

        if (errors.code) { setError('Введите код из письма'); return false; }
        if (errors.newPassword) { setError('Введите новый пароль'); return false; }
        if (errors.confirmPassword && !confirmPassword.trim()) { setError('Подтвердите новый пароль'); return false; }
        if (errors.confirmPassword && newPassword !== confirmPassword) { setError('Пароли не совпадают'); return false; }

        setError(null);
        return true;
    };

     const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsMessageVisible(false);

        if (!validateResetForm()) {
            setTimeout(() => setIsMessageVisible(true), 50);
            return;
        }
        setIsLoading(true);

        try {
            console.log(`[ForgotPasswordPage] Проверка кода: ${code}`);
            // ---> ПРОВЕРЯЕМ КОД (Шаг 3) <---
            const isCodeValid = await UserSettingsService.isValidCode(code, CodeType.RESET_PASSWORD); // Используем RESET_PASSWORD

            if (!isCodeValid) {
                setError('Введен неверный или истекший код подтверждения.');
                setFieldErrors({...fieldErrors, code: true}); // Подсвечиваем поле кода
                setIsLoading(false);
                setTimeout(() => setIsMessageVisible(true), 50);
                return; // Прерываем выполнение
            }

            // ---> ЕСЛИ КОД ВЕРНЫЙ, УСТАНАВЛИВАЕМ НОВЫЙ ПАРОЛЬ (Шаг 4) <---
            console.log(`[ForgotPasswordPage] Код ${code} верный. Попытка сброса пароля...`);
            // ВЫЗЫВАЕМ resetPassword (КОТОРУЮ НУЖНО СОЗДАТЬ И НАСТРОИТЬ!)
            await resetPassword({ code, newPassword });

            setSuccessMessage('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
            // Очищаем все поля для безопасности
            setEmail('');
            setCode('');
            setNewPassword('');
            setConfirmPassword('');
             // Не переключаем шаг, просто показываем успех. Можно добавить кнопку "Войти"
            setTimeout(() => setIsMessageVisible(true), 50);
             // Опционально: редирект на логин через пару секунд
            // setTimeout(() => navigate('/login'), 3000);

        } catch (err: unknown) {
             handleApiError(err, 'Не удалось сбросить пароль.');
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

    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            <div className='w-full max-w-[380px] -mt-48'> {/* Немного увеличил ширину и поднял */}
                {/* --- Форма для ввода Email --- */}
                {pageStep === 'enterEmail' && (
                    <>
                        <div className='text-left mb-4 flex items-center space-x-2 px-1 text-[#4d505e]'> {/* Обновил заголовок */}
                            <SlLock className="text-xl" />
                            <h1 className='text-[19px] font-semibold '>Забыли пароль?</h1>
                        </div>
                        <form onSubmit={handleSendCodeSubmit} className='bg-gray-100 rounded-xl p-6 shadow-sm'> {/* Увеличил padding */}
                            <p className="text-gray-600 text-sm mb-5 text-left"> {/* Добавил текст-пояснение */}
                                Введите свой адрес электронной почты и мы отправим Вам код для сброса пароля.
                            </p>
                            <div className='space-y-4'>
                                <Input
                                    type='email' // Тип email
                                    placeholder='Электронная почта'
                                    value={email}
                                    onChange={handleEmailChange}
                                    icon={<MdOutlineEmail />} // Иконка email
                                    error={fieldErrors.email}
                                />
                            </div>

                            {/* Блок для отображения ошибок валидации или отправки */}
                            {error && (
                                <div className={`mt-4 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                    <MdOutlineInfo className='text-xl flex-shrink-0 mt-0' />
                                    <p className='text-sm text-left'>{error}</p>
                                </div>
                            )}

                            <div className='mt-5'> {/* Увеличил отступ */}
                                <Button type='submit' fullWidth disabled={isLoading}> {/* Блокируем после успеха */}
                                    {isLoading ? 'Отправка...' : 'Отправить код'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {/* --- Форма для ввода Кода и Нового пароля --- */}
                {pageStep === 'enterCodeAndPassword' && (
                    <>
                        <div className='text-left mb-4 flex items-center space-x-2 px-1 text-[#4d505e]'>
                            <MdLockReset className="text-2xl" /> {/* Другая иконка */}
                            <h1 className='text-[19px] font-semibold '>Сброс пароля</h1>
                        </div>
                        <form onSubmit={handleResetPasswordSubmit} className='bg-gray-100 rounded-xl p-6 shadow-sm'>
                            {/* Отображение сообщения об успехе отправки кода */}
                            {successMessage && (
                                <div className={`mb-4 flex items-start space-x-2 text-green-600 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                    {/* Можно иконку */}
                                    <p className='text-sm text-left'>{successMessage}</p>
                                </div>
                            )}
                            {/* Отображение ошибки для этого шага */}
                            {error && !successMessage && ( // Показываем ошибку только если нет сообщения об успехе
                                <div className={`mb-4 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}>
                                    <MdOutlineInfo className='text-xl flex-shrink-0 mt-0' />
                                    <p className='text-sm text-left'>{error}</p>
                                </div>
                            )}
                            {/* Поля для ввода */}
                            <div className='space-y-4 mb-5'>
                                <Input
                                    type='text'
                                    placeholder='Код из письма'
                                    value={code}
                                    onChange={(e) => { setCode(e.target.value); if(e.target.value.trim()) setFieldErrors({...fieldErrors, code: false}); if(error) setError(null); }}
                                    icon={<MdOutlineInfo />} // Иконка информации/кода
                                    error={fieldErrors.code}
                                    disabled={!!successMessage} // Блокируем после успеха
                                />
                                <Input
                                    type='password'
                                    placeholder='Новый пароль'
                                    value={newPassword}
                                     onChange={(e) => { setNewPassword(e.target.value); if(e.target.value.trim()) setFieldErrors({...fieldErrors, newPassword: false}); if(error) setError(null); }}
                                    icon={<SlLock />}
                                    error={fieldErrors.newPassword}
                                    disabled={!!successMessage} // Блокируем после успеха
                                />
                                <Input
                                    type='password'
                                    placeholder='Подтвердите новый пароль'
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); if(e.target.value.trim()) setFieldErrors({...fieldErrors, confirmPassword: false}); if(error) setError(null); }}
                                    icon={<SlLock />}
                                    error={fieldErrors.confirmPassword}
                                    disabled={!!successMessage} // Блокируем после успеха
                                />
                            </div>
                            {/* Кнопка сброса */}
                            <Button type='submit' fullWidth disabled={isLoading || !!successMessage}>
                                {isLoading ? 'Изменение...' : 'Изменить пароль'}
                            </Button>
                        </form>
                    </>
                )}

                <p className='text-center text-xm text-gray-500 mt-5'> {/* Увеличил отступ */}
                    Вернуться ко{' '}
                    <Link to='/login' className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
                        входу
                    </Link>
                </p>
            </div>
        </div>
    );
}; 