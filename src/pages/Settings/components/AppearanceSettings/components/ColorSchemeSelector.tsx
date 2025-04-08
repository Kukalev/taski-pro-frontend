import React, {useState, useEffect} from 'react'
import {
  COLOR_VALUES,
  getMainColor,
  setMainColor,
  ThemeColorType,
  THEMES
} from '../../../../../styles/theme'
import { putColorOnUser } from '../../../../../services/colors/api/putColorOnUser';

// Компонент для выбора цветовой схемы
export const ColorSchemeSelector = () => {
  // Получаем текущий цвет темы при инициализации
  const [selectedColor, setSelectedColor] = useState<ThemeColorType>(getMainColor());
  // Новое состояние для отслеживания наведения мыши
  const [hoveredColor, setHoveredColor] = useState<ThemeColorType | null>(null);
  // Состояния для API
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Синхронизируем selectedColor, если getMainColor() изменился извне (например, после логина)
  useEffect(() => {
    setSelectedColor(getMainColor());
  }, []); // Запускаем при монтировании. Можно добавить зависимость от чего-то, если getMainColor может меняться динамически в других местах.

  // Обработчик смены цвета
  const handleColorChange = async (color: ThemeColorType) => {
    if (isSaving || color === selectedColor) return; // Не сохраняем, если уже сохраняется или цвет тот же

    setSaveError(null); // Сбрасываем ошибку
    setIsSaving(true); // Начинаем сохранение

    // 1. Применяем локально СРАЗУ
    setMainColor(color); // Устанавливаем новый цвет глобально (применяет тему)
    setSelectedColor(color); // Обновляем локальное состояние для отображения галочки

    // 2. Пытаемся сохранить на бэкенд
    try {
      await putColorOnUser(color);
      console.log(`Цвет ${color} успешно сохранен на бэкенде.`);
      // Можно показать сообщение об успехе, если нужно
    } catch (err: any) {
      console.error("Ошибка сохранения цвета на бэкенде:", err);
      setSaveError(err.message || 'Не удалось сохранить тему.');
      // Откатывать локальное изменение? Спорный момент.
      // Пока оставим новый цвет примененным локально, но покажем ошибку.
      // Можно добавить кнопку "Повторить" или откатить:
      // setMainColor(selectedColor); // Вернуть старый цвет
      // setSelectedColor(selectedColor);
    } finally {
      setIsSaving(false); // Завершаем сохранение
    }
  };

  // Получаем все ключи цветов
  const allColorKeys = Object.keys(THEMES) as ThemeColorType[];
  
  // Разделяем на две строки
  const topRowColors = allColorKeys.slice(0, 7);
  const bottomRowColors = allColorKeys.slice(7);

  // Функция для рендеринга кнопки цвета
  const renderColorButton = (colorKey: ThemeColorType) => {
    const hexColor500 = COLOR_VALUES[colorKey]?.['500'] || '#000000'; 
    const isSelected = colorKey === selectedColor;
    const isHovered = colorKey === hoveredColor;

    // Базовый стиль кнопки
    const buttonStyle: React.CSSProperties = {
      backgroundColor: hexColor500,
    };

    // Если выбрана, добавляем CSS-переменную для цвета кольца
    if (isSelected) {
      buttonStyle['--tw-ring-color'] = hexColor500; // Добавляем переменную
    }

    return (
      <button
        key={colorKey}
        title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
        disabled={isSaving} // <-- Блокируем кнопки во время сохранения
        className={`
          w-8 h-8 
          rounded-md 
          flex items-center justify-center 
          shadow-sm 
          transition 
          duration-150 ease-in-out 
          transform hover:scale-110 
          relative
          cursor-pointer
          ring-offset-2 
          ${isSelected ? 'ring-2' : ''} // Класс для толщины и смещения кольца
          ${isSaving ? 'opacity-50 cursor-not-allowed' : ''} // <-- Стили для блокировки
        `}
        // Применяем стили и добавляем as React.CSSProperties
        style={buttonStyle as React.CSSProperties} 
        onClick={() => handleColorChange(colorKey)}
        onMouseEnter={() => !isSaving && setHoveredColor(colorKey)} // Не показываем ховер при сохранении
        onMouseLeave={() => setHoveredColor(null)}
      >
        {/* Показываем галочку или индикатор загрузки */}
        {isSaving && isSelected ? (
           <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
        ) : (isSelected || (isHovered && !isSaving)) && (
          <svg 
            className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-white/70'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    )
  };

  return (
    // Используем flex flex-col для расположения строк друг под другом
    <div className="flex flex-col gap-3"> {/* Уменьшаем gap */} 
      {/* Верхняя строка (7 цветов) */}
      <div className="grid grid-cols-7 gap-3"> {/* Уменьшаем gap */} 
        {topRowColors.map(renderColorButton)}
      </div>
      {/* Нижняя строка (остальные) */}
      <div className="grid grid-cols-7 gap-3"> {/* Уменьшаем gap */} 
        {bottomRowColors.map(renderColorButton)}
      </div>
      {/* Сообщение об ошибке сохранения */}
      {saveError && (
        <div className="mt-2 text-xs text-red-600">
          Ошибка сохранения: {saveError}
        </div>
      )}
    </div>
  );
}; 