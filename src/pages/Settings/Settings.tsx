import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { applyTheme } from '../../styles/theme';

export const Settings = () => {
  useEffect(() => {
    applyTheme();
  }, []);

  // Просто рендерит контент вложенного маршрута (ProfileSettings, etc.)
  return <Outlet />; 
}; 