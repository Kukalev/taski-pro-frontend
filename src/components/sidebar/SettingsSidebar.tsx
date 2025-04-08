import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {useSidebar} from '../../contexts/SidebarContext'
import {MenuItem} from './components/MenuItem' // Переиспользуем MenuItem

// Иконки (можно вынести в отдельный файл или оставить здесь)
const BackIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const ProfileIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const AppearanceIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const SecurityIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;


export const SettingsSidebar = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate('/desk'); // Или куда должна вести кнопка "Назад"
  };

  const handleItemClick = (path: string) => {
    navigate(`/settings/${path}`);
  };

  const isActive = (path: string) => {
    return location.pathname === `/settings/${path}`;
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--theme-color)',
    color: 'white',
    '--hover-bg-color': 'var(--theme-color-dark, var(--theme-color))'
  } as React.CSSProperties;

  return (
    <div
      className="h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 transition-width duration-1000 ease-in-out flex flex-col p-2" // Адаптируй стили под твой дизайн
      style={{ width: isCollapsed ? '56px' : '220px' }} // Адаптируй ширину
    >
      {/* Кнопка Назад */}
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-full px-3 py-2 mb-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg-color)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-color)')}
        title={isCollapsed ? 'Назад' : ''}
      >
        <span className="flex-shrink-0 w-4 h-4"> <BackIcon /> </span>
        {!isCollapsed && <span className='ml-2 whitespace-nowrap'>Назад</span>}
      </button>

      {/* Заголовок секции - теперь рендерится всегда, но анимируется */}
      <h2 
         className="text-[10px] uppercase text-gray-500 font-medium mb-1 px-1 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out" // Добавили whitespace-nowrap, overflow-hidden и transition-*
         style={{
           maxWidth: isCollapsed ? '0' : '200px', // Анимируем ширину
           opacity: isCollapsed ? '0' : '1',      // Анимируем прозрачность
           marginTop: isCollapsed ? '0.75rem' : '0', // Добавляем отступ сверху, когда свернуто, если нужно
           // Если текст "Основные настройки" все еще мешает кнопке "Назад" в свернутом состоянии, 
           // можно добавить height: isCollapsed ? '0' : 'auto' или visibility: isCollapsed ? 'hidden' : 'visible'
         }}
      >
        Основные настройки
      </h2>

      {/* Меню */}
      <nav className="space-y-1">
        <MenuItem
          path='/settings/profile'
          isActive={isActive('profile')}
          onClick={() => handleItemClick('profile')}
          icon={<ProfileIcon />}
          label='Профиль'
          isCollapsed={isCollapsed}
        />
        <MenuItem
          path='/settings/appearance'
          isActive={isActive('appearance')}
          onClick={() => handleItemClick('appearance')}
          icon={<AppearanceIcon />}
          label='Внешний вид'
          isCollapsed={isCollapsed}
        />
        <MenuItem
          path='/settings/security'
          isActive={isActive('security')}
          onClick={() => handleItemClick('security')}
          icon={<SecurityIcon />}
          label='Безопасность'
          isCollapsed={isCollapsed}
        />
      </nav>
      {/* Можно добавить другие элементы сайдбара, если нужно */}
    </div>
  );
}; 