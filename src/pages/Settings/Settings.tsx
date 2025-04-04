import {useState, useEffect} from 'react'
import {Outlet, useNavigate} from 'react-router-dom'
import {SettingsTab} from './types'
import '../../styles/global.css'
import {applyTheme} from '../../styles/theme'

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const navigate = useNavigate()
  
  useEffect(() => {
    applyTheme();
  }, []);
  
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab)
    navigate(`/settings/${tab}`)
  }
  
  const handleBack = () => {
    navigate('/desk')
  }
  
  return (
    <div className="flex h-full">
      <div className="w-[240px] bg-gray-50 border-r border-gray-200">
        <button 
          onClick={handleBack}
          className="cursor-pointer w-auto px-15 py-2.5 text-white flex items-center gap-2 my-2 mx-2 border rounded-md transition duration-300 ease-in-out"
          style={{ 
            backgroundColor: 'var(--theme-color)',
            borderColor: 'var(--theme-color-dark)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-color-dark)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-color)'}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Назад
        </button>

        <div className="px-2 mt-4">
          <div className="text-xs text-gray-500 px-3 mb-2">Основные настройки</div>
          <nav className="space-y-1">
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${activeTab === 'profile' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleTabChange('profile')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Профиль
            </button>
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${activeTab === 'appearance' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleTabChange('appearance')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Внешний вид
            </button>
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${activeTab === 'security' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleTabChange('security')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Безопасность
            </button>
          </nav>
        </div>
      </div>
      
      <div className="flex-1 bg-white">
        <Outlet />
      </div>
    </div>
  )
} 