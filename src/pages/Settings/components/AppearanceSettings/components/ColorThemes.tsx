import {useEffect, useState} from 'react'

type ThemeMode = 'light' | 'dark';

export const ColorThemes = () => {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('light');

  // При монтировании читаем тему из localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setSelectedMode(savedMode);
    } else {
      // Проверяем системные настройки, если в localStorage ничего нет
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSelectedMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setSelectedMode(mode);
    localStorage.setItem('themeMode', mode); // Сохраняем выбор
    // Применяем тему глобально (предполагается, что applyTheme это умеет)
    // Возможно, потребуется отдельная функция или модификация applyTheme
    document.documentElement.classList.toggle('dark', mode === 'dark'); // Пример прямого управления классом
    // applyTheme(); // Переприменение темы может понадобиться для цветов
  };

  // Убираем radioCheckedClasses, используем accent-color
  const radioBaseClasses = "w-4 h-4 border-gray-300 focus:ring-gray-500 accent-gray-600 cursor-pointer"; // Добавлен accent-color и cursor-pointer

  // Стили для контейнера превью
  const previewContainerStyle = "border border-gray-200 rounded-lg p-4"; // Убираем cursor-pointer отсюда
  const previewBoxBaseStyle = "rounded h-24 flex flex-col justify-between p-2 text-xs overflow-hidden relative"; // Добавил relative

  return (
    <div className="mt-8"> {/* Отступ сверху */}
      <h4 className="text-lg font-medium mb-4">Цветовая тема</h4>
      <div className="grid grid-cols-2 gap-6"> {/* Увеличил gap */} 
        {/* Светлая тема - добавляем cursor-pointer к обертке */}
        <div className="cursor-pointer" onClick={() => handleThemeChange('light')}>
          {/* Используем серый цвет для рамки активного превью */}
          <div className={`${previewContainerStyle} ${selectedMode === 'light' ? 'border-gray-400 ring-1 ring-gray-400' : ''}`}>
            <div className={`${previewBoxBaseStyle} bg-white text-gray-700`}>
              {/* Симуляция контента */}
              <div className='font-medium'>Meeting with partner...</div>
              <div className='text-gray-400 flex items-center'>
                <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg> {/* Placeholder Icon */}
                Oct 31, 12:31 AM
              </div>
               {/* Fade effect */}
               <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <input 
              id="light-theme" 
              name="theme-mode" 
              type="radio" 
              value="light" 
              checked={selectedMode === 'light'} 
              onChange={() => handleThemeChange('light')} 
              // Применяем только базовые классы (включая accent-color и cursor-pointer)
              className={`${radioBaseClasses}`}
            />
            {/* У label УЖЕ есть cursor-pointer */}
            <label htmlFor="light-theme" className="ml-2 block text-sm text-gray-700 cursor-pointer">Светлая</label>
          </div>
        </div>

        {/* Темная тема - добавляем cursor-pointer к обертке */}
        <div className="cursor-pointer" onClick={() => handleThemeChange('dark')}>
           {/* Используем серый цвет для рамки активного превью */}
           <div className={`${previewContainerStyle} ${selectedMode === 'dark' ? 'border-gray-400 ring-1 ring-gray-400' : ''}`}>
            <div className={`${previewBoxBaseStyle} bg-gray-800 text-gray-300`}>
              {/* Симуляция контента */}
              <div className='font-medium text-red-400'>Weeek Deve.. &gt; Back log</div> {/* Пример текста */}
              <div className='font-medium'>Meeting with partner...</div>
              <div className='text-gray-500 flex items-center'>
                 <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg> {/* Placeholder Icon */}
                 Oct 31, 02:30 AM
              </div>
              {/* Fade effect */}
              <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-800 to-transparent"></div>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <input 
              id="dark-theme" 
              name="theme-mode" 
              type="radio" 
              value="dark" 
              checked={selectedMode === 'dark'} 
              onChange={() => handleThemeChange('dark')} 
               // Применяем только базовые классы (включая accent-color и cursor-pointer)
               className={`${radioBaseClasses}`}
            />
            {/* У label УЖЕ есть cursor-pointer */}
            <label htmlFor="dark-theme" className="ml-2 block text-sm text-gray-700 cursor-pointer">Тёмная</label>
          </div>
        </div>
      </div>
    </div>
  );
};
