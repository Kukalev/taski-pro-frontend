import {useState} from 'react'
import {
  COLOR_VALUES,
  getMainColor,
  setMainColor,
  ThemeColorType,
  THEMES
} from '../../../../../styles/theme'

// Компонент для выбора цветовой схемы
export const ColorSchemeSelector = () => {
  // Получаем текущий цвет темы при инициализации
  const [selectedColor, setSelectedColor] = useState<ThemeColorType>(getMainColor());
  // Новое состояние для отслеживания наведения мыши
  const [hoveredColor, setHoveredColor] = useState<ThemeColorType | null>(null);

  // Обработчик смены цвета
  const handleColorChange = (color: ThemeColorType) => {
    setMainColor(color); // Устанавливаем новый цвет глобально
    setSelectedColor(color); // Обновляем локальное состояние для отображения галочки
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
        `}
        // Применяем стили и добавляем as React.CSSProperties
        style={buttonStyle as React.CSSProperties} 
        onClick={() => handleColorChange(colorKey)}
        onMouseEnter={() => setHoveredColor(colorKey)}
        onMouseLeave={() => setHoveredColor(null)}
      >
        {(isSelected || isHovered) && (
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
    </div>
  );
}; 