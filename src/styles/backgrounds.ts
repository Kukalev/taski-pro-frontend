// Тип опции фона
export interface BackgroundOption {
  id: string; // Строка для React key и внутреннего использования
  apiId: number; // <<-- Убедись, что это поле добавлено, если API использует числа
  name: string;
  previewUrl: string;
  styleValue: string;
}

// Определяем доступные фоны
// Убедись, что пути к файлам в /public верны!
// Убедись, что apiId соответствуют бэкенду!
export const backgroundOptions: BackgroundOption[] = [
  {
    id: 'default',
    apiId: 0, // Пример ID для API
    name: 'По умолчанию',
    previewUrl: '/default.png', // Замени на реальный путь
    styleValue: "url('/default.png')",
  },
  {
    id: 'wisteria',
    apiId: 1, // Пример ID для API
    name: 'Wisteria',
    previewUrl: '/bg.png', // Замени на реальный путь
    styleValue: "url('/bg.png')",   // Замени на реальный путь
  },
  {
    id: 'flax',
    apiId: 2, // Пример ID для API
    name: 'Flax',
    previewUrl: '/bg1.png', // Замени на реальный путь
    styleValue: "url('/bg1.png')",   // Замени на реальный путь
  },
  {
    id: 'dalle2',
    apiId: 3, // Пример ID для API
    name: 'By DALL-E 2',
    previewUrl: '/bg2.png', // Замени на реальный путь
    styleValue: "url('/bg2.png')",   // Замени на реальный путь
  },
  {
    id: 'royal',
    apiId: 4, // Пример ID для API
    name: 'Royal',
    previewUrl: '/bg3.png', // Замени на реальный путь
    styleValue: "url('/bg3.png')",   // Замени на реальный путь
  },
  // Добавь остальные свои фоны по аналогии
]; 