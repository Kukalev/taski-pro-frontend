import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

// 1. Определяем тип для значения контекста
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  // Можно добавить isAnimating, если нужно управлять анимацией
  // isAnimating: boolean;
}

// 2. Создаем контекст с начальным значением undefined
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 3. Создаем компонент-провайдер
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Начальное состояние - не свернут
  // const [isAnimating, setIsAnimating] = useState(false); // Если нужна анимация

  // Функция для переключения состояния сайдбара
  const toggleSidebar = useCallback(() => {
    // Можно добавить логику анимации здесь, если нужно
    // setIsAnimating(true);
    setIsCollapsed(prev => !prev);
    // setTimeout(() => setIsAnimating(false), 1000); // Завершение анимации (пример)
  }, []);

  // 4. Формируем значение контекста (мемоизируем для оптимизации)
  const value = useMemo(() => ({
    isCollapsed,
    toggleSidebar,
    // isAnimating, // Передаем, если используем
  }), [isCollapsed, toggleSidebar /*, isAnimating*/]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// 5. Создаем и экспортируем кастомный хук для использования контекста
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    // Ошибка, если хук используется вне провайдера
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 