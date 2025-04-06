// Доступные цвета
export type ThemeColorType = 
  'indigo' | 'orange' | 'red' | 'pink' | 'fuchsia' | 
  'blue' | 'sky' | 'cyan' | 'teal' | 'emerald' | 
  'green' | 'gray' | 'black';


// Настройки цветов для каждой темы (оставляем для градиентов и имен Tailwind)
export const THEMES = {
  // Верхний ряд на изображении (слева направо)
  indigo: {
    tailwind: 'indigo',
    gradient: 'from-indigo-400 to-indigo-500',
  },
  orange: {
    tailwind: 'orange',
    gradient: 'from-orange-400 to-orange-500',
  },
  red: {
    tailwind: 'red',
    gradient: 'from-red-400 to-red-500',
  },
  pink: {
    tailwind: 'pink',
    gradient: 'from-pink-400 to-pink-500',
  },
  fuchsia: {
    tailwind: 'fuchsia',
    gradient: 'from-fuchsia-400 to-fuchsia-500',
  },
  blue: {
    tailwind: 'blue',
    gradient: 'from-blue-400 to-blue-500',
  },
  sky: {
    tailwind: 'sky',
    gradient: 'from-sky-400 to-sky-500',
  },
  cyan: {
    tailwind: 'cyan',
    gradient: 'from-cyan-400 to-cyan-500',
  },
  teal: {
    tailwind: 'teal',
    gradient: 'from-teal-400 to-teal-500',
  },
  emerald: {
    tailwind: 'emerald',
    gradient: 'from-emerald-400 to-emerald-500',
  },
  green: {
    tailwind: 'green',
    gradient: 'from-green-400 to-green-500',
  },
  gray: {
    tailwind: 'gray',
    gradient: 'from-gray-400 to-gray-500',
  },
  black: {
    tailwind: 'black',
    gradient: 'from-gray-800 to-gray-900', // Черный не имеет градиента в Tailwind
  }
}

// Карта HEX-значений для Tailwind цветов (по умолчанию)
export const COLOR_VALUES: Record<ThemeColorType, Record<string, string>> = {
  indigo: { '50': '#eef2ff', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5' },
  orange: { '50': '#fff7ed', '400': '#fb923c', '500': '#f97316', '600': '#ea580c' },
  red: { '50': '#fef2f2', '400': '#f87171', '500': '#ef4444', '600': '#dc2626' },
  pink: { '50': '#fdf2f8', '400': '#f472b6', '500': '#ec4899', '600': '#db2777' },
  fuchsia: { '50': '#fdf4ff', '400': '#e879f9', '500': '#d946ef', '600': '#c026d3' },
  blue: { '50': '#eff6ff', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb' },
  sky: { '50': '#f0f9ff', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7' },
  cyan: { '50': '#ecfeff', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2' },
  teal: { '50': '#f0fdfa', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488' },
  emerald: { '50': '#ecfdf5', '400': '#34d399', '500': '#10b981', '600': '#059669' },
  green: { '50': '#f0fdf4', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a' },
  gray: { '50': '#fafafa', '400': '#a3a3a3', '500': '#737373', '600': '#525252' },
  black: { '50': '#111827', '400': '#1f2937', '500': '#111827', '600': '#000000' } // Используем темные оттенки для черного
};

// Начальный цвет
let _mainColor: ThemeColorType = 'gray'; // Поставим teal по умолчанию, как в global.css

// Геттер для получения текущего цвета
export const getMainColor = (): ThemeColorType => _mainColor;

// Функция для установки цвета и автоматического применения темы
export const setMainColor = (color: ThemeColorType): void => {
  if (THEMES[color]) { // Проверяем, что цвет существует
    _mainColor = color;
    applyTheme(color);
  } else {
    console.warn(`Theme color "${color}" not found. Falling back to default.`);
    _mainColor = 'teal'; // Возвращаемся к дефолтному, если цвет не найден
    applyTheme(_mainColor);
  }
};

// Экспортируем mainColor как геттер, чтобы получать актуальное значение
export const mainColor = getMainColor();

// Функция для установки CSS-переменных на основе выбранной темы
export const applyTheme = (theme: ThemeColorType = getMainColor()) => {
  const root = document.documentElement;
  const themeName = THEMES[theme] ? theme : 'teal'; 
  const themeHexColors = COLOR_VALUES[themeName];

  if (!themeHexColors) {
      console.error(`Color values for theme "${themeName}" not found.`);
      return;
  }

  // Основные переменные
  root.style.setProperty('--theme-color', themeHexColors['500']); 
  root.style.setProperty('--theme-color-light', themeHexColors['400']); 
  root.style.setProperty('--theme-color-dark', themeHexColors['600']); 
  root.style.setProperty('--theme-color-bg', themeHexColors['50']); 

  // Переменные для градиента (используем 400 и 600 оттенки)
  root.style.setProperty('--theme-gradient-from', themeHexColors['400']); 
  root.style.setProperty('--theme-gradient-to', themeHexColors['600']);   
};

// Функция для получения градиента для компонентов
export const getGradient = (): string => {
  const theme = getMainColor();
  return THEMES[theme] ? THEMES[theme].gradient : THEMES.teal.gradient;
};

// Применяем тему при загрузке (можно оставить, если applyTheme вызывается и в useEffect)
// if (typeof document !== 'undefined') {
//   applyTheme();
// }



