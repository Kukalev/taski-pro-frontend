import {useEffect, useState} from 'react'
import {Outlet, useLocation, useNavigate} from 'react-router-dom'
import {SettingsTab} from './types'
import '../../styles/global.css'
import {applyTheme} from '../../styles/theme'
import {SettingsLayout} from '../../layouts/SettingsLayout'

const ProfileIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const AppearanceIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const SecurityIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const NotificationsIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const MailingIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IntegrationsIcon = () => <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316M15.316 10.658a3 3 0 100 2.684m0-2.684l-6.632-3.316m0 0a3 3 0 10-2.684 0M14 7a3 3 0 10-2.684 0" /></svg>;

type ExtendedSettingsTab = SettingsTab | 'notifications' | 'mailing' | 'integrations';

export const Settings = () => {
  const location = useLocation();
  const initialTab = location.pathname.split('/settings/')[1] as ExtendedSettingsTab || 'profile';
  const [activeTab, setActiveTab] = useState<ExtendedSettingsTab>(initialTab)
  
  const navigate = useNavigate()
  
  useEffect(() => {
    applyTheme();
  }, []);
  
  useEffect(() => {
    const currentTab = location.pathname.split('/settings/')[1] as ExtendedSettingsTab || 'profile';
    setActiveTab(currentTab);
  }, [location.pathname]);

  const handleTabChange = (tab: ExtendedSettingsTab) => {
    navigate(`/settings/${tab}`)
  }
  
  const handleBack = () => {
    navigate('/desk')
  }
  
  const getNavLinkClass = (tab: ExtendedSettingsTab) =>
    `flex items-center w-full text-left px-2 py-1.5 rounded-md text-[12px] cursor-pointer transition-all duration-150 ease-in-out ${
      activeTab === tab
        ? 'bg-gray-200 text-gray-900 font-semibold'
        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-500'
    }`
  
  return (
    <SettingsLayout>
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <div className="w-55 bg-white border-r border-gray-200 p-2 flex flex-col">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-full px-4 py-2 mb-4 rounded-lg text-white text-sm font-medium cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--theme-color)', 
              '--hover-bg-color': 'var(--theme-color-dark, var(--theme-color))' 
            } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-color)'}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          
          <h2 className="text-[10px] uppercase text-gray-500 font-medium mb-1 px-3">Основные настройки</h2>
          <nav className="space-y-0.5">
            <button 
              className={getNavLinkClass('profile')}
              onClick={() => handleTabChange('profile')}
            >
              <ProfileIcon /> Профиль
            </button>

            <button 
              className={getNavLinkClass('appearance')}
              onClick={() => handleTabChange('appearance')}
            >
              <AppearanceIcon /> Внешний вид
            </button>

            <button 
              className={getNavLinkClass('security')}
              onClick={() => handleTabChange('security')}
            >
              <SecurityIcon /> Безопасность
            </button>

          </nav>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </div>
    </SettingsLayout>
  )
} 