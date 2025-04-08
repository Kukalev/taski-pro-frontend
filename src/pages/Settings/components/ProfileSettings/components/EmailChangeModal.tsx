import React, { useState, useEffect, useRef } from 'react';
import { UserSettingsService, CodeType } from '../../../../../services/userSettings/UserSettings';
import type { EmailChangeStep } from '../../../../../services/userSettings/types';

export interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: () => void; // Функция для вызова при успешной смене email
}

export const EmailChangeModal: React.FC<EmailChangeModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSuccess,
}) => {
  const [step, setStep] = useState<EmailChangeStep>('idle');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setStep('idle'); // Начинаем с начального шага при открытии
      setConfirmationCode('');
      setNewEmail('');
      setError('');
      setSuccessMessage('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Закрытие по клику вне модалки
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  // Обертка для onClose
  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  // --- Обработчики шагов ---

  const handleSendCode = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    // НЕ МЕНЯЕМ ШАГ ЗДЕСЬ, чтобы остаться на 'idle' пока идет загрузка
    // setStep('sendingCode');
    try {
      await UserSettingsService.sendCodeForEmailChange();
      setSuccessMessage(`Код подтверждения отправлен на ${currentEmail}.`);
      setStep('codeSent'); // Переключаем шаг ПОСЛЕ успеха
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить код.');
      // setStep('idle'); // Остаемся на 'idle' при ошибке
    } finally {
      setIsLoading(false); // Сбрасываем загрузку
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationCode) {
      setError('Введите код подтверждения.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    setStep('verifyingCode'); // Можно оставить так, или менять после успеха
    try {
      const isValid = await UserSettingsService.isValidCode(confirmationCode, CodeType.RESET_MAIL);
      if (isValid) {
        setSuccessMessage('Код подтвержден. Введите новую почту.');
        setStep('codeVerified');
        setConfirmationCode('');
      } else {
        setError('Неверный или истекший код подтверждения.');
        setStep('codeSent');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке кода.');
      setStep('codeSent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    // Простая валидация email
     if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
        setError('Введите корректный email адрес.');
        return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    setStep('updatingEmail'); // Можно оставить так, или менять после успеха
    try {
      await UserSettingsService.updateUser({ email: newEmail });
      setSuccessMessage('Электронная почта успешно обновлена!');
      // Вызываем onSuccess, чтобы родительский компонент обновил данные
      onSuccess();
      // Закрываем модальное окно через небольшую задержку, чтобы пользователь увидел сообщение
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить почту.');
      setStep('codeVerified');
       setIsLoading(false); // Сбрасываем isLoading при ошибке здесь
    }
    // Не сбрасываем isLoading при успехе, т.к. окно закроется по таймеру
  };

  if (!isOpen) return null;

  // --- Стили ---
  const inputStyle = "mt-1 p-2 bg-gray-50 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-300 border border-gray-200 placeholder-gray-400 disabled:opacity-50";
  const buttonStyle = `px-4 py-1.5 text-sm rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1`;
  const primaryButtonStyle = `${buttonStyle} bg-[var(--theme-color)] text-white hover:bg-[var(--theme-color-dark)] focus:ring-[var(--theme-color)] disabled:opacity-60 disabled:cursor-not-allowed`;
  const secondaryButtonStyle = `${buttonStyle} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400 disabled:opacity-60`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-150 bg-black/30 backdrop-blur-sm"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Крестик */}
        <button onClick={handleClose} disabled={isLoading} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors disabled:opacity-50" aria-label="Закрыть">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-lg font-semibold mb-4 text-gray-800 mr-6">Изменение электронной почты</h3>

        {/* Шаг 1: Отображение текущей почты и кнопка отправки кода */}
        {step === 'idle' && (
          <div className='space-y-4'>
            <p className="text-sm text-gray-600">Текущий адрес: <span className="font-medium text-gray-800">{currentEmail}</span></p>
            <p className="text-sm text-gray-600">Нажмите кнопку ниже, чтобы отправить код подтверждения на ваш текущий email для начала процесса смены.</p>
             {/* Сообщение об ошибке на шаге idle */}
             {error && (
                 <div className="p-2 text-xs bg-red-50 text-red-600 rounded-md">
                    {error}
                 </div>
             )}
            <div className="flex justify-end items-center space-x-3">
                {/* Показываем текст "Отправка..." если isLoading */}
                {isLoading && <span className="text-sm text-gray-500">Отправка...</span>}
              <button onClick={handleSendCode} disabled={isLoading} className={primaryButtonStyle}>
                {/* Текст кнопки не меняем, т.к. есть отдельный индикатор */}
                Отправить код
              </button>
            </div>
          </div>
        )}

        {/* Шаг 2: Ввод кода */}
        {(step === 'codeSent' || step === 'verifyingCode') && (
            <div className='space-y-3'>
                <p className="text-sm text-gray-600">{successMessage || `Введите код, отправленный на ${currentEmail}.`}</p>
                {/* Ошибка на этом шаге */}
                {error && (
                    <div className="p-2 text-xs bg-red-50 text-red-600 rounded-md">
                        {error}
                    </div>
                )}
                <input
                id="confirmationCode" type="text" placeholder="Код подтверждения"
                className={inputStyle} value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                disabled={isLoading}
                />
                <div className='flex justify-end space-x-2'>
                <button type="button" onClick={handleClose} disabled={isLoading} className={secondaryButtonStyle}>Отмена</button>
                <button type="button" onClick={handleVerifyCode} disabled={!confirmationCode || isLoading} className={primaryButtonStyle}>
                    {isLoading && step === 'verifyingCode' ? 'Проверка...' : 'Подтвердить код'}
                </button>
                </div>
            </div>
        )}

        {/* Шаг 3: Ввод новой почты */}
        {(step === 'codeVerified' || step === 'updatingEmail') && (
            <div className='space-y-3'>
                <p className="text-sm text-gray-600">{successMessage || 'Код подтвержден. Введите новый email.'}</p>
                 {/* Ошибка на этом шаге */}
                 {error && (
                    <div className="p-2 text-xs bg-red-50 text-red-600 rounded-md">
                        {error}
                    </div>
                )}
                <input
                id="newEmail" type="email" placeholder="Новая электронная почта"
                className={inputStyle} value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isLoading}
                />
                <div className='flex justify-end space-x-2'>
                <button type="button" onClick={handleClose} disabled={isLoading} className={secondaryButtonStyle}>Отмена</button>
                <button type="button" onClick={handleUpdateEmail} disabled={!newEmail || isLoading} className={primaryButtonStyle}>
                    {isLoading && step === 'updatingEmail' ? 'Сохранение...' : 'Сохранить почту'}
                </button>
                </div>
            </div>
        )}

        {/* Убираем отдельный блок для финальной ошибки/успеха, т.к. они теперь показываются на своих шагах */}

      </div>
    </div>
  );
}; 