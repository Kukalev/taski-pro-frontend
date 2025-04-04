import { useState } from 'react'
import { THEMES, ThemeColorType, getMainColor, setMainColor, COLOR_VALUES } from '../../../../../styles/theme'

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

  return (
    <div>
      <h4 className="text-lg font-medium mb-4">Цвет акцента</h4>
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-4"> {/* Увеличил gap */}
        {(Object.keys(THEMES) as ThemeColorType[]).map((colorKey) => {
          // Пропускаем 'black' и 'gray', если не хотим их показывать как акцентные
          // if (colorKey === 'black' || colorKey === 'gray') return null;

          const hexColor500 = COLOR_VALUES[colorKey]?.['500'] || '#000000'; 
          const isSelected = colorKey === selectedColor;
          const isHovered = colorKey === hoveredColor; // Проверяем, наведен ли курсор

          // Определяем базовые стили кнопки
          const buttonStyle: React.CSSProperties = {
            backgroundColor: hexColor500,
          };

          // Если кнопка ВЫБРАНА, добавляем цвет кольца в стили
          // Цвет кольца будет равен цвету самого квадратика
          if (isSelected) {
            buttonStyle.ringColor = hexColor500;
          }

          return (
            <button
              key={colorKey}
              title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} // Название цвета для title
              // Стили кнопки: круглая, размер, центрирование, тень, плавный переход
              className={`
                w-10 h-10 
                rounded-md /* Делаем квадрат с закругленными углами */
                flex items-center justify-center 
                shadow-md 
                transition 
                duration-150 ease-in-out 
                transform hover:scale-110 
                relative /* Для позиционирования галочки */
                cursor-pointer /* Добавляем курсор-указатель */
                ${isSelected ? 'ring-2 ring-offset-2' : ''} /* Классы для кольца добавляем только если выбрано */
              `}
              style={buttonStyle} // Применяем стили (backgroundColor и ringColor если выбрано)
              // Вызываем обработчик смены цвета при клике
              onClick={() => handleColorChange(colorKey)}
              // Добавляем обработчики наведения
              onMouseEnter={() => setHoveredColor(colorKey)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              {/* Показываем галочку, если цвет ВЫБРАН или НАВЕДЕН */}
              {(isSelected || isHovered) && (
                <svg 
                  className={`
                    w-5 h-5 
                    ${isSelected ? 'text-white' : 'text-white/70'} /* Белая для выбранного, полупрозрачная для наведения */
                  `} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
       {/* Сюда можно добавить выбор светлой/темной темы, если нужно */}
      {/* <div className="mt-8">
        <h4 className="text-lg font-medium mb-4">Цветовая тема</h4>
        <div className="grid grid-cols-2 gap-4">
           Опции светлой/темной темы 
        </div>
      </div> */}
    </div>
  );
}; 